import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import App from './app.vue'
import axios from 'axios'
// import jquery from 'jquery'
import 'babel-polyfill'

import 'assets/js/global.js'
import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'

Vue.prototype.$ajax = axios
// Vue.prototype.$jquery = jquery

Vue.use(ElementUI)

// 路由。
Vue.use(VueRouter)

import Camera from 'components/monitor/monitor.vue'

// 定义路由
const routes = [{
  path: '/camera',
  component: Camera,
  props: (route) => route.query
}]

// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  routes // （缩写）相当于 routes: routes
})

// 状态管理。
Vue.use(Vuex)

// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import { loginModule } from 'assets/js/loginStore.js'
// 引用工厂定制模块
import { factoryModule } from 'assets/js/factoryStore.js'
import { versionModule } from 'assets/js/versionStore.js'

Vue.prototype.$register = loginFn

const store = new Vuex.Store({
  modules: {
    loginModule,
    factoryModule,
    versionModule
  }
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
