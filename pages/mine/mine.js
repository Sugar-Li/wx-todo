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