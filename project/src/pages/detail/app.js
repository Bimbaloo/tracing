import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-green/index.css'
import 'theme/index.css'
import App from './app.vue'
import axios from 'axios'
import 'babel-polyfill'

import 'assets/css/icon.less'
import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/js/global.js'

// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import {
  loginModule
} from 'assets/js/loginStore.js'
// 引用工厂定制模块
// import { customModule } from 'assets/js/customStore.js'
import {
  versionModule
} from 'assets/js/versionStore.js'

Vue.use(VueRouter)
Vue.use(ElementUI)

Vue.prototype.$ajax = axios
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {
  params: oParams
})
Vue.prototype.$post = axios.post

// import Stock from 'components/stock/stock.vue'
// import Trace from 'components/trace/trace.vue'
// import Track from 'components/track/track.vue'
const Stock = r => require.ensure([], () => r(require('components/stock/stock.vue')), 'group-datail')
const Storage = r => require.ensure([], () => r(require('components/stock/storage.vue')), 'group-datail')
const Batch = r => require.ensure([], () => r(require('components/stock/batch.vue')), 'group-datail')
const Suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-datail')
const Trace = r => require.ensure([], () => r(require('components/trace/trace.vue')), 'group-datail')
const Track = r => require.ensure([], () => r(require('components/track/track.vue')), 'group-datail')

// 定义路由
const routes = [{
  path: '/stock/:key',
  component: Stock,
  children: [{
    path: '',
    component: Storage,
    meta: {
      title: 'storage'
    }
  }, {
    path: 'batch',
    component: Batch,
    meta: {
      title: 'batch'
    }
  }, {
    path: 'restrain',
    component: Suspicious,
    meta: {
      title: 'restrain'
    }
  }]
},
{
  path: '/trace_up/:key',
  component: Trace
},
{
  path: '/trace_down/:key',
  component: Track
}
]

// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  routes // （缩写）相当于 routes: routes
})

Vue.use(Vuex)

Vue.prototype.$register = loginFn

const store = new Vuex.Store({
  modules: {
    loginModule,
    // customModule
    versionModule
  }
})

window.vm = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
