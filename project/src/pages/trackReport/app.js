import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-green/index.css'
import 'theme/index.css'
import App from './app.vue'
import axios from 'axios'
import 'babel-polyfill'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'
// import 'assets/js/html2canvas.js'
import 'assets/js/global.js'// 引用登录模块。

import loginFn from 'assets/js/loginFn.js'
import {loginModule} from 'assets/js/loginStore.js'

Vue.use(ElementUI)

Vue.prototype.$ajax = axios
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {'params': oParams})
Vue.prototype.$post = axios.post

Vue.use(Vuex)

Vue.prototype.$register = loginFn

const store = new Vuex.Store({
  modules: {
    loginModule
  }
})

window.vm = new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
