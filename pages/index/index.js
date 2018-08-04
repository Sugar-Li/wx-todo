Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		content:'',
		todos:[],
		finished:false,
		leftCount:0,
		allSetting:true,
		clearSetting:true,
		allFinished:false
	},

	// 获取data中的todos保存todos到本地缓存的函数
	save(){
		wx.setStorageSync("todos", this.data.todos)
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		//获取todos，根据todos的信息，得到leftCount，和allFinished的值
		var todos = wx.getStorageSync("todos")
		if (todos) {
			// 获取leftCount
			var leftCount = todos.filter(function (item) {
				return !item.finished
			}).length
			this.setData({
				todos: todos,
				leftCount: leftCount,
				allFinished: !leftCount
			})
		}
		var allSetting = this.data.allSetting
		var clearSetting = this.data.clearSetting
		this.setData({
			clearSetting: clearSetting,
			allSetting: allSetting
		})
	},

//旷宿创建一个todo
// 获取todo中的content
	inputTodo(e){
		this.setData({
			content:e.detail.value
		})
	},

	addTodo(e){
		console.log(e)
		if(!this.data.content||!this.data.content.trim()){
			return
		}
		// 获取todos
		var todos=this.data.todos
		var todo={
			content:this.data.content,
			tags:[],
			extra:'',
			finished:false,
			// 创建时间
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

	// 跳转到添加待办页面
	navTo:function(){
		wx.navigateTo({
			url: '/pages/detail/detail',
		})
	},

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
	},

	// 移除todo
	onItemRemove(e){
		var index=e.currentTarget.dataset.index
		var todos=this.data.todos
		var remove=todos.splice(index,1)[0]
		this.setData({
			todos:todos,
			leftCount: this.data.leftCount - (remove.finished?0:1)
		})
		this.save()
		getApp().writeHistory(remove,'delected',+new Date())
	},

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
		getApp().writeHistory(null,allFinished?"finishedAll":"restartAll",+new Date())
	},

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




})