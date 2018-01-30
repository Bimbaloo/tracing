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
    // 是否需要登录
    ssoLogin: false,
		// 是否开启摄像头功能。
    camera: true
  },
  mutations: {
    updateVersionData (state, payload) {
      payload.key.forEach(o => {
        if (state[o.name] != null) {
          state[o.name] = (o.value !== 'false')
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
    getVersion ({
      commit
    }, oData) {
      const aoData = oData.customFeatureInfoList
      if (aoData && aoData.length) {
        // 更新数据。
        commit({
          type: 'updateVersionData',
          key: aoData
        })
      }
    }
  },
  getters: {}
}
