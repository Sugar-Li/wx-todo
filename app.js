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
			
			// 而todo里的content必然不为空才能创建处理
			todo:todo?{
				content:todo.content||'',
				tags:todo.tags||[],
				extra:todo.extra||'',
			}:'',
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