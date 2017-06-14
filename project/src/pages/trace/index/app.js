import Vue from 'vue'
import VueRouter from 'vue-router'
import go from 'gojs'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'

import App from './app.vue'
import axios from 'axios'
import Vuex from 'vuex'

import 'assets/css/reset.css'
import 'assets/css/common.css'

Vue.use(ElementUI)

Vue.prototype.$ = go.GraphObject.make;
Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

const Stock = r => require.ensure([], () => r(require('components/stock/stock.vue')), 'group-datail')
const Storage = r => require.ensure([], () => r(require('components/stock/storage.vue')), 'group-datail')
const Batch = r => require.ensure([], () => r(require('components/stock/batch.vue')), 'group-datail')
const Suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-datail')
const Trace = r => require.ensure([], () => r(require('components/trace/trace.vue')), 'group-datail')
const Track = r => require.ensure([], () => r(require('components/track/track.vue')), 'group-datail')

Vue.use(VueRouter)
// 定义路由
const routes = [{ 
    path: '/stock/:key', 
    component: Stock,
    children: [{
      path: '',
      component: Storage
    },{
      path: 'batch',
      component: Batch
    },{
      path: 'restrain',
      component: Suspicious
    }]
  },
  { path: '/trace', component: Trace },
  { path: '/track', component: Track }
]

// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  routes // （缩写）相当于 routes: routes
})


Vue.use(Vuex) 
// 定义统一状态。
const store = new Vuex.Store({
  state: {
    key: "",
    chrome: /chrome/i.test(navigator.userAgent)
  },
  mutations: {
    updateTree (state, payload) {
    	payload.tree.model = new go.GraphLinksModel(payload.data.node, payload.data.link);	
    },
    updateCatalog (state, payload) {
    	payload.catalog.model = new go.TreeModel(payload.data);	
    },    
    updateCatalogKey (state, payload) {
    	state.key = payload.key;
    }
  }
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})