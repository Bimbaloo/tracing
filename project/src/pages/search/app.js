import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import App from './app.vue'
import axios from 'axios'
import Vuex from 'vuex'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/js/global.js'
import 'babel-polyfill'

Vue.use(ElementUI)

Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

Vue.use(Vuex)

const loginModule = {
  state: {
    token: null,
    userId: null,
    userName: null
  },
  mutations: {
    updateLoginInfo (state, payload) {
      state.token = window.Rt.utils.cookie("token");
      state.userId = window.Rt.utils.cookie("userId");
      state.userName = window.Rt.utils.cookie("userName");
    }    
  },
  actions: {},
  getters: {}
}


const store = new Vuex.Store({
  modules: {
    loginModule
  }
})

// store.state.loginModule // -> loginModule 的状态

new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
