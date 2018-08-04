Page({
	data:{
		// 行为
		actionTexts:{
			'create':'创建',
			'delected':'删除',
			'finished':'完成',
			'restart':'重启',
			'finishedAll':'完成所有待办事项',
			'restartAll':'重启所有待办事项',
			'clearAll':'清除所有待办事项'
		},
		// 是否显示时间，默认是false
		timeSetting:false,

	},

	// 获取history
	onShow:function(){
		var history=wx.getStorageSync("history")
		if(history){
			this.setData({
				history:history
			})
			//调用processHistory方法
			this.processHistory()
		}

		// 获取系统设置中的timeSetting，判断是否显示时间
		var timeSetting=wx.getStorageSync("timeSetting")
		if (typeof timeSetting=='boolean'){
			this.setData({
				timeSetting: timeSetting
			})
		}
	},

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

	save(){
		wx.setStorageSync("history", this.data.history)
	}



})