export const loginModule = {
    state: {
        token: null,
        userId: null,
        username: null,
        nickname: null
    },
    mutations: {
        updateLoginInfo (state, payload) {
            state.token = window.Rt.utils.cookie("token");
            state.userId = window.Rt.utils.cookie("userId");
            state.username = window.Rt.utils.cookie("username");
            state.nickname = window.Rt.utils.cookie("nickname");
        }    
    },
    actions: {},
    getters: {}
}
