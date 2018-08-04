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