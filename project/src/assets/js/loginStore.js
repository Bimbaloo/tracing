export const loginModule = {
  state: {
    token: null,
    userId: null,
    username: null,
    nickname: null,
        // 当前程序进度标记
    progressId: null
  },
  mutations: {
    updateLoginInfo (state, payload) {
      state.token = window.Rt.utils.cookie('token')
      state.userId = window.Rt.utils.cookie('userId')
      state.username = window.Rt.utils.cookie('username')
      state.nickname = window.Rt.utils.cookie('nickname')
      state.progressId = window.Rt.utils.cookie('progressId')
    }
  },
  actions: {},
  getters: {}
}
