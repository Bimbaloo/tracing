import Vue from 'vue'
import VueRouter from 'vue-router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import App from './app.vue'
import axios from 'axios'
import Vuex from 'vuex'
import echarts  from 'echarts'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'
import 'assets/js/global.js'
import 'babel-polyfill'

Vue.use(ElementUI)

Vue.prototype.$echarts = echarts

Vue.prototype.$ajax = axios
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

Vue.use(Vuex)

// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import {loginModule} from 'assets/js/loginStore.js'

Vue.prototype.$register = loginFn;

const store = new Vuex.Store({
  modules: {
    loginModule
  }
})

Vue.use(VueRouter)

const Parameter = r => require.ensure([], () => r(require('components/process/parameter.vue')), 'group-detail') //工艺参数

const routes = [
    { path: '/parameter', component: Parameter }
]

const router = new VueRouter({
    routes // （缩写）相当于 routes: routes
})

new Vue({
  el: '#app',
  store,
  router,
  render: h => h(App)
})
