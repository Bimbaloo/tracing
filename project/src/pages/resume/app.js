import Vue from 'vue'
import Vuex from 'vuex'
import ElementUI from 'element-ui'
import 'theme/index.css'
import App from './app.vue'
import axios from 'axios'
// import $ from 'jquery'
import 'babel-polyfill'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'
// import 'assets/js/html2canvas.js'
import 'assets/js/global.js'
// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import {loginModule} from 'assets/js/loginStore.js'
// 应用版本信息模块
import { versionModule } from 'assets/js/versionStore.js'

Vue.use(ElementUI)
Vue.prototype.$ajax = axios

Vue.use(Vuex)

Vue.prototype.$register = loginFn

const store = new Vuex.Store({
  modules: {
    loginModule,
    versionModule
  }
})

window.vm = new Vue({
  el: '#app',
  store,
  render: h => h(App)
})
