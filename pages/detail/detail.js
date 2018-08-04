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
			content:this.data.content,
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