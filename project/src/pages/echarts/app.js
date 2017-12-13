import Vue from 'vue'
import VueRouter from 'vue-router'
import go from 'gojs'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'

import App from './app.vue'
import axios from 'axios'
import echarts  from 'echarts'
import Vuex from 'vuex'
import 'babel-polyfill'

import 'assets/js/global.js'
import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'

Vue.use(ElementUI)

import "ag-grid/dist/styles/ag-grid.css"
import "ag-grid/dist/styles/theme-fresh.css"

Vue.prototype.$ = go.GraphObject.make;
Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

// 添加echarts。
Vue.prototype.$echarts = echarts


Vue.use(Vuex)
// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import {loginModule} from 'assets/js/loginStore.js'

Vue.prototype.$register = loginFn;

new Vue({
  el: '#app',
  render: h => h(App)
})