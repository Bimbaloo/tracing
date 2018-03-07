// 设置seletc、multiselect选项。
export const optionsModule = {
  state: {
    // 工序。
    processCode: null,
    // 物料。
    matearialCode: null,
    // 人员。
    personCode: null,
    // 设备。
    equipmentCode: null
  },
  mutations: {
    // 设置选项参数。
    setOptionsData (state, payload) {
      state[payload.key] = payload.value
    }
  },
  actions: {},
  getters: {}
}
