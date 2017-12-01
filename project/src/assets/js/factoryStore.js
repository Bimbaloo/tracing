import axios from 'axios'

/**
 * 获取设备分析下工厂定制模块。
 */
export const factoryModule = {
  state: {
    fetched: false,
    factoryCustomItemList: []
  },
  mutations: {
    updateFactoryData (state, payload) {
      state.factoryCustomItemList = payload.config
    },
    updateFetchFlag (state, payload) {
      state.fetched = payload.flag
    }
  },
  actions: {
    /**
     * 获取工厂定制数据。
     * @param {Object}
     * @return {Promise}
     */
    getFactoryConfig ({ commit }) {
      // 更新是否获取数据的标记。
      commit({
        type: 'updateFetchFlag',
        flag: true
      })
      
      return axios.get(HOST + '/api/v1/customized/equipment-analysis/items').then(response => {
        // 更新数据。
        commit({
          type: 'updateFactoryData',
          config: JSON.parse(JSON.stringify(response.factoryCustomItemList))
        })
      })
      .catch(error => console.log('获取工厂定制内容失败。'))
    }
    
  },
  getters: {}
}
