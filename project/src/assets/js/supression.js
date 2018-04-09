// 设置seletc、multiselect选项。
export const supressionModule = {
  state: {
    // 可疑品列表是否为空
    hasSupressionList: true
  },
  mutations: {
    // 设置选项参数。
    setSupressionList (state, payload) {
      state.hasSupressionList = payload.value
    }
  },
  actions: {},
  getters: {}
}
