/**
 * 获取设备分析下工厂定制模块。
 */
export const factoryModule = {
  state: {
    fetched: false,
    factoryCustomItemList: [],
    factoryCameraConfig: {
      url: ''
    }
  },
  mutations: {
    updateFactoryData (state, payload) {
      state.factoryCustomItemList = payload.config || []
    },
    updateFetchFlag (state, payload) {
      state.fetched = payload.flag
    },
    updateCameraData (state, payload) {
      state.factoryCameraConfig = payload.config || { url: '' }
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

      const aoData = oData.factoryCustomItemList
      const oCameraData = oData.cameraData || {
        url: 'http://192.168.118.220:801/page/commandCenter/camera-iframe-flv.html',
        quality: true,
        pool: true,
        work: true,
        event: true,
        repair: true,
        tool: true,
        parameter: true
      }
      // 更新数据。
      commit({
        type: 'updateFactoryData',
        config: aoData
      })
      // 更新数据。
      commit({
        type: 'updateCameraData',
        config: oCameraData
      })
    }
  },
  getters: {}
}
