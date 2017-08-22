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

//import 'assets/js/html2canvas.js'
import 'assets/js/global.js'
import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'

Vue.use(ElementUI)

Vue.prototype.$ = go.GraphObject.make;
Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

// 添加echarts。
Vue.prototype.$echarts = echarts

const Stock = r => require.ensure([], () => r(require('components/material/stock.vue')), 'group-detail')
const Storage = r => require.ensure([], () => r(require('components/material/storage.vue')), 'group-detail')
const Batch = r => require.ensure([], () => r(require('components/stock/batch.vue')), 'group-detail')
const Suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-detail')

const Process = r => require.ensure([], () => r(require('components/process/stock.vue')), 'group-detail')
const List = r => require.ensure([], () => r(require('components/process/list.vue')), 'group-detail')
const Chart = r => require.ensure([], () => r(require('components/process/chart.vue')), 'group-detail')
const Detail = r => require.ensure([], () => r(require('components/process/detail.vue')), 'group-detail')
const Product = r => require.ensure([], () => r(require('components/process/product.vue')), 'group-detail')     //投产表
const QtReport = r => require.ensure([], () => r(require('components/process/qtReport.vue')), 'group-detail')   //质检
const QcReport = r => require.ensure([], () => r(require('components/process/qcReport.vue')), 'group-detail')   //送检检
const FgbReport = r => require.ensure([], () => r(require('components/process/fgbReport.vue')), 'group-detail') //fgb质检
const Tool = r => require.ensure([], () => r(require('components/process/tool.vue')), 'group-detail')           //工具
const Event = r => require.ensure([], () => r(require('components/process/event.vue')), 'group-detail')         //事件
const Repair = r => require.ensure([], () => r(require('components/process/repair.vue')), 'group-detail')       //维护记录

const Trace = r => require.ensure([], () => r(require('components/trace/trace.vue')), 'group-detail')
const Track = r => require.ensure([], () => r(require('components/track/track.vue')), 'group-detail')

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
      component: Chart//List
    },{
      path: 'detail',
      component: Detail
    },{
      path: 'product',
      component: Product
    },{//质检
      path: 'qtReport',
      component: QtReport
    },{//送检
      path: 'qcReport',
      component: QcReport
    },{//fgb
      path: 'fgbReport',
      component: FgbReport
    },{//工具
      path: 'tool',
      component: Tool
    },{//事件
      path: 'event',
      component: Event
    },{//维护记录
      path: 'repair',
      component: Repair
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
    treeFullscreen: true,
    // 原始树数据。
    rawData: [],
    resizeY: 0
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
    },
    // 更新树型图形的放大。
    updateTreeFullscreen (state, payload) {
    	state.treeFullscreen = payload.key;
    },
    // 更新上下拖拽事件
    updateResizeY (state, payload) {
      state.resizeY = payload.key;
    },
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