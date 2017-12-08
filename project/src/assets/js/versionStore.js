import axios from 'axios'

// 配置是否为老版本
export const versionModule = {
	state: {
		// 新老业务库。
		isOpDbBeforeRefact: false,
		// 遏制。
		supression: false,
		// 断链修复。
		linkRepair: false,
		// 工具。
		toolManagement: false,
		// 工艺。
		processParameter: false,
		// 维护。
		equipmentMaintenance: false,
		// fgb。
		fgb: false,
		// 设备监控。
		camera: false
	},
	mutations: {
		updateVersionData (state, payload) {
			// state.isOpDbBeforeRefact = payload.key
			payload.key.forEach(o => {
				if(state[o.name] != null) {
					state[o.name] = (o.value === "false" ? false : true)
				}
			})
		}
	},
	actions: {
		/**
		 * 获取版本信息配置。
		 * @param {Object}
		 * @return {Promise}
		 */
		getVersion ({ commit }) {
			//HOST + '/api/v1/customized/features'
			return axios.get("../static/version.json").then( response => {
				// 获取数据
				// let bBefore = false
				let oResult = response.data	  
				if(!oResult.errorCode) {
					let oData = oResult.data.customFeatureInfoList//.filter( o => o.name === 'isOpDbBeforeRefact' )
				
					if(oData && oData.length ) {
					// 	bBefore = (oData[0].value === "false" ) ? false : true
						// 更新数据。
						commit({
							type: 'updateVersionData',
							key: oData//bBefore
						})
					}	
					
				}else {
					console.log(oResult.errorMsg.message)
				}
			})
			.catch(error => console.log('获取版本信息失败。'))
		}
	},
	getters: {}
}
