# Todo项目



## 前言：

​	本文主要是参考学堂在线学习小程序的todo案例，根据自己学习过程的一些体会编写，希望小伙伴能一起学习进步。



## 整体布局

+ app.json
  + 这个项目主要包括6个页面
  + 设置头部导航栏的颜色，字体等
  + 底部标签栏

```shell
{
  "pages":[
    "pages/index/index",
    "pages/history/history",
    "pages/mine/mine",
    "pages/detail/detail",
    "pages/personal/personal",
    "pages/setting/setting"
    
  ],
  "window":{
    "backgroundTextStyle":"light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "WeChat",
    "navigationBarTextStyle":"black"
  }
}

```





+ app.wxss
  + 全局样式只设置了一个主容器container

```css
/**app.wxss**/
.container {
	padding: 25rpx;
	border-bottom: 1rpx solid #ddd;
	font-size:30rpx;
	align-items: center
	color: #9b9b9b	
} 

```



+ app.js
  + 初始化完成时，触发onLaunch，获取用户的avatar头像信息和nickName昵称信息，主要是方便 **我的** 页面获取
  + 根据todo，行为action，时间段timestamp创建一个函数，用来保存首页操作todo的历史

```javascript
App({

	// 当小程序初始化完成时，会触发onLaunch（全局只触发一次）
	onLaunch:function(){
		// 在本地内存中获取nickName和avatarUrl
		var nickName=wx.getStorageSync("nickName")
		var avatarUrl = wx.getStorageSync("avatarUrl")

		// 如果都不存在，则从用户信息中获取
		if(!nickName||!avatarUrl){
			wx.getUserInfo({
				success:res=>{
					// console.log(res)
					// 将nickName和avatarUrl保存到本地缓存中
					wx.setStorageSync("nickName", res.userInfo.nickName)
					wx.setStorageSync("avatarUrl", res.userInfo.avatarUrl)
				}
			})
		}
	},

	// 将todo操作写入到历史中
	writeHistory:function(todo,action,timestamp){
		//获取本地缓存中的history或者一个空数组
		var history=wx.getStorageSync("history")||[]
		// 创建一个新的history
		var newHistory={
			// 因为todo必然存在才会触发这个函数
			// 而todo里的content必然不为空才能创建处理
			todo:{
				content:todo.content||'',
				tags:todo.tags||[],
				extra:todo.extra||'',
			},
			action:action,
			timestamp:timestamp
		}
		// 将history追加到histories中去
		history.push(newHistory)
		wx.setStorage({
			key: 'history',
			data: history,
		})
	}

})
```

> 注意：由于在全部切换和删除全部选中时，是没有todo项的，此时todo为null，所以在创建newHistory时必须考虑到todo为null的情况

```javascript
	todo:todo?{
				content:todo.content||'',
				tags:todo.tags||[],
				extra:todo.extra||'',
			}:'',
```



## 首页



### 顶部创建

+ wxml

```html
	<view class='header'>
		<view class='quick'>
			<view class='icon'>
				<text>+</text>
			</view>
			<input class='content' placeholder='请输入待办事情'></input>
		</view>
		<view class='new'>添加待办</view>
	</view>
```



+ wxss

```css
.header{
	display: flex;
	align-items: center;
	margin-bottom:30rpx
}

.quick{
	display: flex;
	border: 1px solid #ddd;
	align-items: center;
	flex:1;
	padding: 20rpx;
	color: #9b9b9b
}
.quick .icon{
	width: 40rpx;
	color: #7ed321;
	font-size: 40rpx;
	margin-right: 10rpx;
	font-style: bold;
}
.quick .content{
	flex: 1;
	font-size: 30rpx
}

.header .new{
	color: #7ed321;
	padding-left: 10rpx;
	width: 120rpx;
	font-size: 30rpx
}
```



+ js
  + 先创建跳转事件，然后先编写detail页面，这样可以得到详细的todos和todo是怎样的，方便快速创建函数的创建
  + 获取快速创建框的内容，并保存到content中
  + 创建快速创建函数
    + 判断data中是否存在content且content不为空
    + 获取todos
    + 创建一个todo
      + content
      + finished
      + id（时间）
    + 将todo push到todos中
    + 更新data
      + todos
      + todo
      + leftCount（为完成的任务）
    + 调用`save（）`函数将最新的todos保存在本地缓存中（因为save函数是获取当前data中的todos保存到当地缓存中的，所以必须线更新data，再调用函数）
    + 调用全局函数，将创建todo这一行为写入到history中

```javascript
	// 获取data中的todos保存todos到本地缓存的函数
	save(){
		wx.setStorageSync("todos", this.data.save)
	},

// 获取todo中的content
	inputTodo(e){
		this.setData({
			content:e.detail.value
		})
	},


	addTodo(e){
		console.log(e)
		if(!this.data.content||!this.data.content.trim()){
			// if (!e.detail.value.trim()){
			return
		}
		// 获取todos
		var todos=wx.getStorageSync("todos")
		var todo={
			content:this.data.content,
			tags:[],
			extra:'',
			finished:false,
			id:+new Date()
		}
		todos.push(todo)
		this.setData({
			todos:todos,
			content:'',
			leftCount:this.data.leftCount+1
		})
		this.save()
		getApp().writeHistory(todo,'create',+new Date())
	},

	navTo:function(){
		wx.navigateTo({
			url: '/pages/detail/detail',
		})
	},
```

### 内容设置

+ todo切换
+ 删除
+ 全部切换
+ 删除选中
+ 显示未完成项目



wxml：

+ 存在todos
  + 遍历todos
  + 调用组件设置todo——跳转设置自定义组件（因为这个组件在history也会用到）
  + 底部功能
    + 全部切换
    + 显示为完成项目
    + 删除选中
+ 没有todos时
  + 设置页面

```html
<view class='container'>
	<!--头部  -->
	<view class='header'>
		<view class='quick'>
			<view class='icon'>
				<text>+</text>
			</view>
			<input class='content' placeholder='请输入待办事情'
				bindinput='inputTodo'
				bindblur='addTodo'
			></input>
		</view>
		<view class='new' bindtap='navTo'>添加待办</view>
	</view>

	<!--内容  -->
	<block wx:if='{{todos.length}}'>

		<view class='todos'>
			<item wx:for="{{todos}}" wx:key="id"
				content="{{item.content}}"
				tags="{{item.tags}}"
				extra="{{item.extra}}"
				finished="{{item.finished}}"
				data-index="{{index}}"
				bind:itemremove='onItemRemove'
				bindtap='toggleTodo'
			>			
			</item>
		</view>

		<view class='footer'>
			<!--allSetting 是设置中的变量，用来判断是否使用这个功能点  -->
			<text class='btn' wx:if='{{allsetting}}' bindtap='toggleAll'>
		nihaop
			</text>

			<!-- 剩余未完成 当leftCount==0时，这一项小时 -->
			<text wx:if="{{leftCount}}">{{leftCount}}未完成</text>

			<!-- 删除所有选中项目 判断clearSetting是否为true -->
			<text class='btn'
				wx:if='{{ todos.length>leftCount}}'
				wx:if='{{clearSetting}}'
				bindtap='clearFinished'
			>清除所有</text>
		</view>
	</block>

	<!--todos不存在时  -->
	<block wx:else>
		<view class='empty'>
			<text class='title'> 恭喜</text>
			<text class='content'> 已经完成全部所有待办事情</text>
		</view>
	</block>
</view>
```



js：

+ 监听页面显示
  + 获取todos
    + 根据todos信息，得到leftCount
    + 根据leftCount获取allFinished的Boolean值
  + 获取allSetting权限——我的里面设置有选择，可以选择能否使用这两个功能
  + 获取clearSetting权限

```javascript
	onShow: function () {
		//获取todos，根据todos的信息，得到leftCount，和allFinished的值
		var todos=wx.getStorageSync("todos")
		if(todos){
			// 获取leftCount
			var leftCount=todos.filter(function(item){
				return !item.finished
			}).length
			this.setData({
				todos:todos,
				leftCount:leftCount,
				allFinished:!leftCount
			})
		}
	},
```



+ 切换todo状态
  + 更加dataset获取当前todo的index
  + 获取todos，根据index从todos中获取当前的todo
  + 更该finished完成状态
    + 根据finished获取leftCount，然后获取allFinshed

```javascript
	// 切换todo的状态
	toggleTodo(e){
		// console.log(e)
		var index=e.currentTarget.dataset.index
		var todos=this.data.todos
		// 获取当前todos中的index指向的todo
		var todo=todos[index]
		// 转换finished完成状态
		todo.finished=!todo.finished
		// 根据todo的状态获取leftCount
		var leftCount=this.data.leftCount+(todo.finished?-1:1)
		this.setData({
			todos:todos,
			leftCount: leftCount,
			allFinished:!leftCount
		})
		this.save()
		getApp().writeHistory(todo,todo.finished?"finished":'restart',+new Date())
	}
```



+ 删除当前todo
  + 获取index
  + 获取todos
  + 根据index，在todos中移除一项todo，并获取移除去的项
  + 根据移除项的状态来获取leftCount

```javascript
	// 移除todo
	onItemRemove(e){
		var index=e.currentTarget.dataset.index
		var todos=this.data.todos
		var remove=todos.splice(index,1)[0]
		this.setData({
			todos:todos,
			leftCount: this.data.leftCount - (remove.finished?0:1)
		})
	},
```

+ 全部切换
  + 因为全部切换和全部删除要用到 **我的** 页面里**设置**页面的权限，所以在进行这两个处理函数之前，需要先去完成 **我的** 页面的设置 
  + 获取切换后的allFinished，将todos中所有todo.finished的值改成allFinished
  + 更新数据
    + allFinished
    + todos
    + leftCount

```javascript
// 切换所有
	toggleAll(){
		// 将自己切换成原来样式相反
		var allFinished=!this.data.allFinished
		// 遍历todos，将todos中的finished的值转变成allFinished
		var todos=this.data.todos.map(function(todo){
			todo.finished = allFinished
			return  todo
		})
		this.setData({
			todos:todos,
			leftCount: allFinished?0:todos.length,
			allFinished:allFinished
		})
		this.save()
		 getApp().writeHistory(null,allFinished?'finishedAll':'restartAll',+new Date())
	},
```

+ 删除选中
  + 获取todos中未选中的
    + filter（）方法——包含通过所提供函数实现的测试的所有元素。  
  + 将为选中的数组保存到todos中

```javascript
// 清除所有
	clearFinished(e){
		var todos=this.data.todos
		var remainer=todos.filter(function(todo){
			return !todo.finished
		})
		this.setData({
			todos:remainer,
		})
		this.save()
		getApp().writeHistory(null,"clearAll",+new Date())
	}
```



### detail事件详情页

wxml：

+ 标签创建分两种情况
  + 标签输入框默认存在
  + 标签显示在标签输入框上方，只有在存在标签的时候
  + 最多设置3个标签，设置完成后会将输入框锁定

```html
<view class='container'>
<!--内容  -->
	<view class='section'>
		<input class='content' placeholder='待办内容'
			bindinput='inputContent' auto-focus='true'
		></input>
	</view>

	<!-- 存在tags时的存在 -->
	<view class='tags' wx:if='{{tags.length}}'>
		<!-- 遍历tags  -->
		<view class='tag' wx:for='{{tags}}' wx:key='index'>
			<!--tags 的样式  -->
			<text class='text'>{{item}}</text>
			<icon class='remove' type='clear' size='16' data-index="{{index}}"
			bindtap='removeTag'
			></icon>
		</view>
	</view>

	<!-- 默认存在的tags输入框 -->
	<view class='section'>
		<input class='tags' placeholder='添加标签...' 
			wx:if='{{ tags.length<3}}'
			auto-focus value='{{tag}}'
			bindblur='addTag'
		></input>
		<input value='最多出入三个标签'
		disabled
		wx:if='{{tags.length>=3}}'
		></input>
	</view>

<!--备注  -->
	<view class='section'>
		<text>备注：</text>
		<textarea auto-height='true'
			bindinput='inputExtra'
		></textarea>
	</view>

<!--button  -->
	<button type='primary' bindtap='create'>创建</button>
</view>
```



js:

+ 获取Contain
+ 获取extra
+ 添加tag
  + 获取tags
  + 获取tag（两边无空格）
  + 判断tag是为空
  + 将tag push 到tags中
  + 更新Data（注意将tag恢复默认，目的是为了让输入框恢复默认值）
+ 删除tag
  + 获取当前tag的index（根据样式中设置data-index，在逻辑层中可以获取）
  + 根据index从tags中移除
+ 创建一个todo
  + 判断是有内容
    + 没有则弹出相应信息提示
  + 从本地缓存中获取todos，如果不存在则定义todos为空数组
  + 创建一个todo
  + 将todo push 到todos中
  + 保存todos到本地缓存中
  + 调用全局函数，将创建todo这一行为写入到history中
  + 返回到上一页

```javascript
Page({
	data:{
		tags:[],
		tag:'',
		content:'',
		extra:''
	},

	//获取content
	inputContent(e){
		this.setData({
			content:e.detail.value
		})
	},

	//获取extra
	inputExtra(e){
		this.setData({
			extra: e.detail.value
		})
	},

	//创建tag
	addTag(e){
		// 获取tags
		var tags=this.data.tags
		//获取tag
		var tag=e.detail.value.trim()
		if(!tag){
			return
		}
		tags.push(tag)
		this.setData({
			tags:tags,
			tag:''
		})
	},

	//删除tag
	removeTag(e){
		console.log(e)
		var index=e.currentTarget.dataset.index
		var tags=this.data.tags
		tags.splice(index,1)
		this.setData({
			tags:tags
		})
	},

	// 创建todo
	 create(){
		if(!this.data.content){
			wx.showToast({
				title: '请输入待办内容',
				icon:'none'
			})
			return	 
	 	}
		//  获取todos，如果不存在则获取一个空数组
		var todos=wx.getStorageSync("todos")||[]
		// 创建todo
		var todo={
			content:this.data.conten,
			tags:this.data.tags,
			extra:this.data.extra
		}
		todos.push(todo)
		// 保存todos到本地缓存中
		wx.setStorageSync("todos", todos)
		// 调用全局函数
		getApp().writeHistory(todo,'create',+new Date())
		// 返回上一页
		wx.navigateBack()
 }
})
```



至此，我们可以得到一个todo对象，里面包含了content（必须包含），tags和extra

本地缓存中也保存了包含todo对象的todos数组。

在此可以返回到首页进行快速创建的逻辑攥写，以及后续的todo



## 我的

+ 头部个人信息
  + 头像和昵称都是从用户信息中获取
  + 点击头像可以更换图片
+ 个人设置
  + 跳转的个人 personal 页面
+ 系统设置
  + 跳转到setting页面



html：

+ 在avatar中绑定触发changeAvatar的处理函数事件
+ 在两个item中加data-target，便于navTo处理函数辨认跳转

```html
<view class='container'>
	<!--头像  -->
	<view class='avatar'>
		<image src='{{ avatarUrl}}' bindtap='changeAvatar'></image>
	</view>
	<!--昵称  -->
	<view class='nickName'>{{nickName}}</view>
	<!--个人设置  -->
	<view class='item'
		data-target='personal'
		bindtap='navTo'
	>
		<text>个人信息</text>
		<text>→</text>
	</view>
	<!--系统设置  -->
	<view class='item'
		data-target='setting'
		bindtap='navTo'
	>
		<text>系统设置</text>
		<text>→</text>
	</view>
</view>
```



js:

+ 监听页面显示
  + 获取avatarUrl和nickName
+ navTo
+ 切换图片

```javascript
// pages/mine/mine.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		avatarurl:'',
		nickName:''
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
		var avatarUrl = wx.getStorageSync('avatarUrl')
		var nickName = wx.getStorageSync("nickName")
		this.setData({
			avatarUrl: avatarUrl,
			nickName:nickName
		})
  },

	navTo(e){
		// console.log(e)
		var target=e.currentTarget.dataset.target
		wx.navigateTo({
			url: target==="personal"?"/pages/personal/personal":"/pages/setting/setting",
		})
	},

	// 改变头像
	changeAvatar:function(e){
		var that=this
		wx.chooseImage({
			success: function(res) {
				var tempFilePaths = res.tempFilePaths
				// var tempFilePath = tempFilePaths[0]
				// wx.setStorageSync("avatarUrl", tempFilePath)
				// that.setData({
				// 	avatarUrl: tempFilePath
				// })
				console.log(tempFilePaths[0])
				wx.saveFile({
					// 需要保存的文件的临时路径
					tempFilePath: tempFilePaths[0],
					success:function(res){
						console.log(res)
						var saveFilePath=res.savedFilePath
						wx.setStorageSync("avatarUrl", saveFilePath)
						that.setData({
							avatarUrl: saveFilePath
						})
					}
				})
			},
		})
	}				
		
})
```

### personal页面

+ 修改avatar
+ 修改姓名

html：

```html
<view class='container'>
	<view class='item'>
		<text>设置头像</text>
		<image src='{{ avatarUrl }}' bindtap='changeAvatar'></image>
	</view>
	<view class='item'>
		<text>设置用户名</text>
		<input value='{{nickName}}' bindblur='blurName' bindconfirm='changeName'></input>
	</view>

</view>
```



js:

+ 修改头像
+ 修改nickName
  + 失去焦点时返回缓存中的nickName
  + 确认时将当前value保存到缓存中



```javascript
// pages/personal/personal.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		nickName:'',
		avatar:''
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
		var avatarUrl = wx.getStorageSync("avatarUrl")
		var nickName = wx.getStorageSync("nickName")
		this.setData({
			nickName:nickName,
			avatarUrl:avatarUrl
		})
  },

	// 改变头像
	changeAvatar: function (e) {
		var that = this
		wx.chooseImage({
			success: function (res) {
				var tempFilePaths = res.tempFilePaths
				// var tempFilePath = tempFilePaths[0]
				// wx.setStorageSync("avatarUrl", tempFilePath)
				// that.setData({
				// 	avatarUrl: tempFilePath
				// })
				console.log(tempFilePaths[0])
				wx.saveFile({
					// 需要保存的文件的临时路径
					tempFilePath: tempFilePaths[0],
					success: function (res) {
						console.log(res)
						var saveFilePath = res.savedFilePath
						wx.setStorageSync("avatarUrl", saveFilePath)
						that.setData({
							avatarUrl: saveFilePath
						})
					}
				})
			},
		})
	},

	blurName(e){
		var nickName=wx.getStorageSync("nickName")
		this.setData({
			nickName:nickName
		})
	},

	changeName(e){
		var nickName=e.detail.value.trim()
		if (nickName){
			wx.setStorageSync("nickName", nickName)
		}
	}
})
```



### setting页面

html：

```html
<view class='container'>
	<view class='title'>待办</view>
	<!--允许全选  -->
	<view class='section'>
		<text>允许全选</text>
		<switch checked='{{ allSetting }}' data-setting="allSetting" bindchange='toggleSetting'></switch>
	</view>
	<!--允许删除所以已完成  -->
	<view class='section'>
		<text>允许清空所有已完成</text>
		<switch checked='{{ clearSetting }}' data-setting="clearSetting" bindchange='toggleSetting'></switch>
	</view>
	
	<view class='title'>历史</view>
	<!--显示操作时间  -->
	<view class='section'>
		<text>显示操作时间</text>
		<switch checked='{{ timeSetting }}' data-setting="timeSetting" bindchange='toggleSetting'></switch>
	</view>
</view>
```

js:

+ toggle时，获取当前的setting和value值，并保存到本地缓存中备用

```javascript
// pages/setting/setting.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
		allSetting:true,
		clearSetting:true,
		timeSetting:false
  },

	toggleSetting(e){
		//console.log(e)
		var setting=e.currentTarget.dataset.setting
		var value=e.detail.value
		wx.setStorageSync(setting, value)
		this.setData({
			setting:value
		})
	}




 
})
```

+ 监听页面加载



```javascript
 /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
		var that=this
		//callback 传入三个参数 分别是当前值（对象），index，array
		//在 ( [ ` 三种符号开头时，必须添加分号；
		;['allSetting', 'clearSetting', 'timeSetting'].forEach(function (e) {
			//此时 e 就是当前处理的对象，value就是这个键的值
		var value=wx.getStorageSync(e);
	
		if(typeof value ==='boolean'){
			// var config={}
			// config[e]=value;
			// that.setData(config)
			that.setData({
				e:value
			})
		}
		});
  },
```



## 历史



html：

+ 判定dates存在
  + 输出dates
  + 遍历groupedHistory[item] 
    + 输出历史事件
      + 判断行为是 增删切换
        + 如果允许显示时间(这个参数在系统设置中选定)，则显示时间和文本
        + 如果不允许，则只显示文本
        + 根据组件显示todo
      + 判断行为是全部切换或全部删除
        + 只显示文本
+ 当dates不存在时，也就是说没有创建任何事件行为等
  + 显示一些文字



```html
<view class='container'>

	<!--判断datas  -->
	<block wx:if="{{dates.length}}">
		<block wx:for='{{ dates }}' wx:key='index'>
			<!--输出dates  -->
			<text class='date'>{{item}}</text>

			<!--循环遍历  这里的item是上面的日期date-->
			<block wx:for='{{groupedHistory[item]}}' wx:key='index'>
				<!-- 输出history -->
				<view class='history-item'>

					<!--此时的item是history对象  -->
					<!--判断item.action 是增，删，切换时 -->
					<block wx:if='{{item.action==="create"||item.action==="delected"||item.action==="finished"||item.action==="restart"}}'>
						<!--1. 如果存在timeSetting,即允许显示时间 (默认是false，需要在系统设置中变换) -->
						<!--判断time Setting  -->
						<block wx:if="{{timeSetting}}">
							<!--文本与时间  -->
							<view class='action-with-time'>
								<!--文本  -->
								<view class='action-icon {{item.action}}'>{{actionTexts[item.action]}}</view>
								<!--时间  -->
								<view class='time'>{{ item.time }}</view>
							</view>
						</block>
						<!-- 判断timeSetting -->
						<block wx:else>
							<!--只显示文本  -->
							<view class='action-icon {{item.action}}'>{{actionTexts[item.action]}}</view>							
						</block>

						<!-- 2. 显示todo -->
						<item class='todo'
							content='{{item.todo.content}}'
							tags='{{item.todo.tags}}'
							action='{{item.todo.action}}'
							data-index='{{ item.index }}'
							bind:itemremove='onItemRemove'
						></item>
					</block>

					<!--判断item  全部切换和全部删除已选-->
					<block wx:else>
						<view class='action {{item.action}}'>{{actionText[item.action]}}</view>
					</block>
					
				</view>
			</block>
		</block>
	</block>

<!--判断dates  -->
	<block wx:else>
		<view class='empty'>
			<text class='title'>暂无历史数据</text>
			<text class='content'>请前往【待办】添加待办事件</text>
		</view>
	</block>
</view>
```



js:

+ 监听页面显示
  + 获取本地缓存中的history并保存到data中
    + 调用processHistory（）方法
  + 获取系统设置中的timeSetting，判断是否显示时间 



+ processHistory（）方法——何在一起的history
  + 获取histories——因为这是很多个history对象组成的数组
  + 定义dats为一个空数组
  + 定义groupedHistory
    + 用`map`方法创建一个新数组，其结果是该数组中的每个元素都调用一个提供的函数后返回的结果。
      + 获取item.index
      + 获取item.date
      + 获取item.time
      + 将这三个键值对写入到history中每一个对应的对象中
    + `reverse()`将数组中的对象反过来，目的是为之前的histories数组中的对象是按时间顺序保存的，现在我们需要展示的时候，希望能够展示最早的历史数据，所以要将数组反转
    + `reduce()` 方法对累加器和数组中的每个元素（从左到右）应用一个函数，将其减少为单个值 
      + 此时的prev是之前积累的groupedHistory，cur是当前的history对象
      + 判断当前对象的时间在不在之前的对象中出现过
        + 如果没有，则用这个时间作为key建立一个空数组
        + 将这个时间追加到dates
      + 然后将当前对象追加到对应时间（key）的 数组中
      + 将这个组合对象输出
  + 更新data的groupedHistory 和dates

> groupedHistory是一个对象，key是日期，值是数组，
>
> 其中这个数组是一个对象数组，数组里是相应的history对象
>
> 每一个history对象中包含6个键值对
>
> 分别是todo action timestamp date time index
>
> 其中todo包含 content tags extra

```javascript
// 获取dates 和 groupedHistory
	processHistory:function(){
		// 暂时定义为histories数组
		var histories=this.data.history
		var dates=[]
		// 数组使用 map（）方法，数组中每一个对象调用回调函数后返回与1以个结果，最后这些结构组成新的数组
		// console.log(histories)
		var groupedHistory=histories.map(function(history,index){
			// console.log(history)
			// 获取当前的date
			var date=new Date(history.timestamp)
			history.index = index
			history.date=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()
			history.time=date.getHours()+':'+date.getMinutes()+':'+date.getSeconds()
			return history
		}).reverse().reduce(function(prev,cur){
			if(!prev[cur.date]){
				// 根据当前对象的日期创建一个空数组
				prev[cur.date]=[]
				// 将当前history对象的日期date写入到dates
				dates.push(cur.date)
			}
			// 将当前对象写入到对应的日期数组中
			prev[cur.date].push(cur)
			return prev
		},{})

		this.setData({
			groupedHistory: groupedHistory,
			dates:dates
		})
	},
```



+ 移除历史todo
  + 获取index和history
  + 在history中移除当前index的项
  + 更新data
  + 调用processHistory （）方法更新 dates 和 groupedHistory 
  + 调用save（）方法保存history到本地缓存

```javascript
// 移除历史todo
	onItemRemove:function(e){		
		var index=e.currentTarget.dataset.index
		var history=this.data.history
		history.splice(index,1)
		this.setData({
			history:history
		})
		this.processHistory()
		this.save()
		console.log("gaga")
	},
```



+ save()

```javascript
	save(){
		wx.setStorageSync("history", this.data.history)
	}
```





## components

+ json
  + 设置components必须在组件json中定义
  + 

```json
{
	"components":true,
	"usingComponents":{}
}
```

+ wxml
  + 设置单个框的样式时，如果存在action且finished，则这个框有另外的finished类样式
    + icon选择器获取的标准是无action，则这个是专供index页面的
    + 处理content
      + 存在tags时
      + 不存在tags时
    + 设置备注折叠时的icon
      + 存在extra才存在
      + 颜色转化，collapsed压缩时是绿色，展开时是灰色
      + 注册绑定事件toggleExtra
    + 移除icon
      + 
  + 备注展开时的样式（!collapsed）

```html
<!--整体的框  -->
<view class='item-container'>
	<!--单个框,它的类样式有两个，第二个是用在history中的,当不存在action且finished时才会触发finished 样式  -->
	<view class='item {{action ? "":(finished ?"finished":"")}}'>
		<!--icon选择器,完成和未完成是两个不同的类型icon,最后的判断是不存在action才能触发  -->
		<icon class='checkbox' type='{{finished?"success":"circle"}}' wx:if='{{!action}}'></icon>
		
		<!--存在tags时  -->
		<block wx:if='{{tags.length}}'>
			<!--设置包含tags的内容  -->
			<view class='content-tags'>
				<view class='content'>{{ content }}</view>
				<view class='tags'>
					<text class='tag' wx:for='{{tags}}' wx:key='index'>{{item}}</text>
				</view>
			</view>
		</block>
		<!--不存在tags时  -->
		<block wx:else>
			<view class='content'>{{ content }}</view>
		</block>

		<!--设置备注折叠时的icon  -->
		<icon type='info' size='16' 
		color='{{collapsed? "#7ed321":"#ddd"}}'
		wx:if='{{ extra }}'
		catchtap='toggleExtra'
		>
		</icon>

		<!--移除icon  -->
		<icon type='clear' size='16'
			catchtap='removeTodo'
		></icon>

	</view>

	<!--展开备注  -->
	<view class='extra-detail' wx:if='{{!collapsed}}'>
		<textarea auto-height disabled value='{{ extra}}'></textarea>
	</view>

</view>
```













## 遇到的问题

1. 想请假一下大家，我要切换头像，使用 chooseImage获取图像的本地路径，然后直接保存到本地缓存，然后更新Data，可以达到效果。代码如下：

   ```javascript
   // 改变头像
   	changeAvatar:function(e){
   		var that=this
   		wx.chooseImage({
   			success: function(res) {
   				var tempFilePaths = res.tempFilePaths
   				var tempFilePath = tempFilePaths[0]
   				wx.setStorageSync("avatarUrl", tempFilePath)
   				that.setData({
   					avatarUrl: tempFilePath
   				})
   			},
   		})
   	}
   ```

   

   。但是我参考的demo做法是，获取到图片的本地路径后，调用 wx.saveFile 保存文件到本地，代码如下:

   ```javascript
   	// 改变头像
   	changeAvatar:function(e){
   		var that=this
   		wx.chooseImage({
   			success: function(res) {
   
   				var tempFilePaths = res.tempFilePaths
   				console.log(tempFilePaths[0])
   				wx.saveFile({
   					// 需要保存的文件的临时路径
   					tempFilePath: tempFilePaths[0],
   					success:function(res){
   						console.log(res)
   						var saveFilePath=res.savedFilePath
   						wx.setStorageSync("avatarUrl", saveFilePath)
   						that.setData({
   							avatarUrl: saveFilePath
   						})
   					}
   				})
   			},
   		})
   	}
   ```

   

   这两种方法得到的视图效果是一样的，但是是不是存在某些保存文件或者图片什么的不一样的地方啊？我想请大神帮忙解惑一下，这两种方法是否都可以使用，这两种方法的区别，优略在哪里，最后这两个保存路径是更改了的难道知识为了科学保存图片吗？感谢解惑  

   回答;

   第一种方法需要将路径保存到本地缓存中

   第二种方法其实已经将路径保存到file中了，需要的时候可以调用，不需要再保存到缓存中去

2. 

