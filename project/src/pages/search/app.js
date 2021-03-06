import Vue from 'vue'
import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-green/index.css'
import 'theme/index.css'
import App from './app.vue'
import axios from 'axios'
import Vuex from 'vuex'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'
import 'assets/js/global.js'
import 'babel-polyfill'
// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import { loginModule } from 'assets/js/loginStore.js'
// 引用工厂定制模块。
// import { customModule } from 'assets/js/customStore.js'
// 引用版本设置模块。
import { versionModule } from 'assets/js/versionStore.js'
// 引入选项设置模块。
import { optionsModule } from 'assets/js/optionsStore.js'

Vue.use(ElementUI)

Vue.prototype.$ajax = axios
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, { params: oParams })
Vue.prototype.$post = axios.post

Vue.use(Vuex)

Vue.prototype.$register = loginFn

const store = new Vuex.Store({
  modules: {
    loginModule,
    // customModule
    versionModule,
    optionsModule
  }
})

window.vm = new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
