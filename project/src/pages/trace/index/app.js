import Vue from 'vue'
import VueRouter from 'vue-router'
import go from 'gojs'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'

import App from './app.vue'
import axios from 'axios'
import Vuex from 'vuex'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'

Vue.use(ElementUI)

Vue.prototype.$ = go.GraphObject.make;
Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

const Stock = r => require.ensure([], () => r(require('components/material/stock.vue')), 'group-datail')
const Storage = r => require.ensure([], () => r(require('components/material/storage.vue')), 'group-datail')
const Batch = r => require.ensure([], () => r(require('components/stock/batch.vue')), 'group-datail')
const Suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-datail')

const Process = r => require.ensure([], () => r(require('components/process/stock.vue')), 'group-datail')
const List = r => require.ensure([], () => r(require('components/process/list.vue')), 'group-datail')
const Detail = r => require.ensure([], () => r(require('components/process/detail.vue')), 'group-datail')
const Product = r => require.ensure([], () => r(require('components/process/product.vue')), 'group-datail')

const Trace = r => require.ensure([], () => r(require('components/trace/trace.vue')), 'group-datail')
const Track = r => require.ensure([], () => r(require('components/track/track.vue')), 'group-datail')

Vue.use(VueRouter)
// 定义路由
const routes = [{ 
    path: '/stock', 
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
  },{ 
    path: '/process', 
    component: Process,
    children: [{
      path: '',
      component: List
    },{
      path: 'detail',
      component: Detail
    },{
      path: 'product',
      component: Product
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
	    root: "",
	    chrome: /chrome/i.test(navigator.userAgent),
	    type: "",
			// 
			fullscreen: false,
			// 原始树数据。
	    rawData: []
  	},
  	mutations: {  
	    updateKey (state, payload) {
	    	state.key = payload.key;
	    },
	    updateRoot (state, payload) {
	    	state.root = payload.key;
	    },
	    updateType (state, payload) {
	    	state.type = payload.key;
	    },
	    updateData (state, payload) {
	    	state.rawData = payload.data || [];
	    },
			updateFullscreen (state, payload) {
				state.fullscreen = payload.key;
			}
  	},
  	actions: {
	  updateRootAsync ({ commit }) {
	    setTimeout(() => {
	      commit('updateRoot')
	    }, 1000)
	  }
	}
})

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})