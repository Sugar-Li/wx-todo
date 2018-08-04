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


	 onLoad: function (options) {
		var that=this
		//callback 传入三个参数 分别是当前值（对象），index，array
		//在 ( [ ` 三种符号开头时，必须添加分号；
		;['allSetting', 'clearSetting', 'timeSetting'].forEach(function (e) {
			//此时 e 就是当前处理的对象，value就是这个键的值
		var value=wx.getStorageSync(e);
	console.log(e)
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

	 toggleSetting(e) {
		 console.log(e)
		 var setting = e.currentTarget.dataset.setting
		 var value = e.detail.value
		 wx.setStorageSync(setting, value)
		
	 },
 
})