/**
 * 获取设备分析下工厂定制模块。
 */
export const factoryModule = {
  state: {
    fetched: false,
    cameraFetched: false,
    factoryCustomItemList: [],
    factoryCameraConfig: {
      url: '',
      dimensions_config: []
    }
  },
  mutations: {
    updateFactoryData (state, payload) {
      state.factoryCustomItemList = payload.config || []
    },
    updateFetchFlag (state, payload) {
      state.fetched = payload.flag
    },
    updateCameraFlag (state, payload) {
      state.cameraFetched = payload.flag
    },
    updateCameraData (state, payload) {
      state.factoryCameraConfig = payload.config || { url: '', dimensions_config: [] }
    }
  },
  actions: {
    /**
     * 获取工厂定制数据。
     * @param {Object}
     * @return {Promise}
     */
    getFactoryConfig ({ commit }, oData) {
      // 更新是否获取数据的标记。
      commit({
        type: 'updateFetchFlag',
        flag: true
      })

      // 更新数据。
      commit({
        type: 'updateFactoryData',
        config: oData.factoryCustomItemList
      })
    },
    /**
     * 获取视频监控数据。
     * @param {Object}
     * @return {Promise}
     */
    getCameraConfig ({ commit }, oData) {
      // 更新是否获取数据的标记。
      commit({
        type: 'updateCameraFlag',
        flag: true
      })

      // 更新数据。
      commit({
        type: 'updateCameraData',
        config: oData
      })
    }
  },
  getters: {}
}
