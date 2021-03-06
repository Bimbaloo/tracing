import Vue from 'vue'
// import VueRouter from 'vue-router'
import go from 'gojs'
import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-green/index.css'
// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import {loginModule} from 'assets/js/loginStore.js'
// 应用版本信息模块
import { versionModule } from 'assets/js/versionStore.js'
// 引入选项设置模块。
import { optionsModule } from 'assets/js/optionsStore.js'
import 'theme/index.css'

import App from './app.vue'
import axios from 'axios'
import Vuex from 'vuex'
import 'babel-polyfill'

import 'assets/js/global.js'
import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'

Vue.use(ElementUI)

Vue.prototype.$ = go.GraphObject.make
Vue.prototype.$ajax = axios
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {'params': oParams})
Vue.prototype.$post = axios.post

Vue.use(Vuex)

Vue.prototype.$register = loginFn

// 定义统一状态。
const store = new Vuex.Store({
  modules: {
    loginModule,
    versionModule,
    optionsModule
  },
  state: {
  },
  mutations: {
  },
  actions: {}
})

window.vm = new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
