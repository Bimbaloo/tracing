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
      parameters: [],
      interface: '',
      interfaceParameters: [],
      dimensions: []
      // dimensions_config: []
    },
    // 自定义字段
    customized: {
      items: []
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
      state.factoryCameraConfig = payload.config
    },
    // 获取最新的 Items
    updateCustomizedItems (state, payload) {
      state.customized['items'] = [...payload.data]
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
    },
    /**
     * 获取Items数据。
     */
    getCustomizedItems ({ commit }, oData) {
      // 更新Items
      commit({
        type: 'updateCustomizedItems',
        data: oData
      })
    }
  },
  getters: {
    // 默认字段
    defaultItems: state => {
      return state.customized['items'].filter(item => item.isUserDefined !== 1)
    },
    // 自定义字段
    userDefinedItems: state => {
      return state.customized['items'].filter(item => item.isUserDefined === 1 && !!item.itemName).map((el, index) => {
        el.index = index + 1
        return el
      })
    },
    // 可以新增的自定义字段
    canUserDefinedItems: state => {
      return state.customized['items'].filter(item => item.isUserDefined === 1 && !item.itemName)
    }
  }
}
