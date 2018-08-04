Component({
	// 对外的属性列表
	properties:{
		content:{
			type:String,
			value:''
		},
		tags:{
			type:Array,
			value:[]
		},
		extra:{
			type:String,
			value:''
		},
		finished:{
			type:Boolean,
			value:false
		},
		action:{
			type:String,
			value:''
		},
	},

	data:{
		collapsed:true
	},


	// 组件的生命周期函数，在组件实例进入页面节点树时执行
	attached: function () {
		// console.log('component attached')
	},

	//组件生命周期函数，在组件实例被从页面节点树移除时执行
	detached: function () {
		// console.log('component detached')
	},

	methods:{
		toggleExtra(){
			this.setData({
				collapsed:!this.data.collapsed
			})
		},
		removeTodo(){
			// triggerEvent--触发事件
			//即该函数触发绑定名为itemremove的事件
			this.triggerEvent('itemremove')
		}
	}


})