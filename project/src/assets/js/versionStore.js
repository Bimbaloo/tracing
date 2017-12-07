import axios from 'axios'

// 配置是否为老版本
export const versionModule = {
	state: {
		isOpDbBeforeRefact: false
	},
	mutations: {
		updateVersionData (state, payload) {
			state.isOpDbBeforeRefact = payload.key
		}
	},
	actions: {
		/**
		 * 获取版本信息配置。
		 * @param {Object}
		 * @return {Promise}
		 */
		getVersion ({ commit }) {
			
			return axios.get(HOST + '/api/v1/customized/features').then( response => {
				// 获取数据
				let bBefore = false
				
				if(!response.errorCode) {
					let oData = response.data.data.customFeatureInfoList.filter( o => o.name === 'isOpDbBeforeRefact' )
				
					if(oData && oData.length ) {
						bBefore = (oData[0].value === "false" ) ? false : true
					}
					
					// 更新数据。
					commit({
						type: 'updateVersionData',
						key: bBefore
					})
				}else {
					console.log(response.data.errorMsg.message)
				}
			}).catch(error => console.log('获取版本信息失败。'))
		}
	},
	getters: {}
}
