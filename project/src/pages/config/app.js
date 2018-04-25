import Vue from 'vue'
import VueRouter from 'vue-router'

import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-green/index.css'
import 'theme/index.css'
import App from './app.vue'
import axios from 'axios'
import Vuex from 'vuex'

import 'assets/js/global.js'
import 'babel-polyfill'
import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'

/* 拖动组件 */
import VueDND from 'awe-dnd'
import query from '../../components/config/newquery.vue'
import field from '../../components/config/field.vue'
import factory from '../../components/config/factory.vue'
import link from '../../components/config/customLink.vue'
import camera from '../../components/config/customCamera.vue'
// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import { loginModule } from 'assets/js/loginStore.js'
// 引用工厂定制模块
import { versionModule } from 'assets/js/versionStore.js'
// 引用工厂定制模块
import { factoryModule } from 'assets/js/factoryStore.js'
Vue.use(VueDND)

Vue.use(VueRouter)
Vue.use(ElementUI)

Vue.prototype.$ajax = axios

// 定义路由
const routes = [
  { path: '/query', component: query },
  { path: '/field', component: field },
  {
    path: '/factory',
    redirect: '/factory/link',
    component: factory,
    children: [{
      path: '/factory/link',
      component: link
    }, {
      path: '/factory/camera',
      component: camera
    }]
  }
]

// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  routes // （缩写）相当于 routes: routes
})

Vue.use(Vuex)

Vue.prototype.$register = loginFn

// 定义统一状态。
const store = new Vuex.Store({
  modules: {
    loginModule,
    versionModule,
    factoryModule
  },
  state: {
    edit: false,
    ModuleOrderListEdit: false
  },
  mutations: {
    updateEdit (state, payload) {
      state.edit = payload.key
    },
    updateModuleOrderListEdit (state, payload) {
      state.ModuleOrderListEdit = payload.key
    }
  },
  actions: {}
})

window.vm = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
