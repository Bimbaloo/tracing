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




/* 节点动作 */
const BarcodeManage = r => require.ensure([], () => r(require('components/processNode/barcodeManage.vue')), 'group-detail')             // 条码管理
const Warehouse = r => require.ensure([], () => r(require('components/processNode/warehouse.vue')), 'group-detail')                         //仓库操作
const Workshop = r => require.ensure([], () => r(require('components/processNode/workshop.vue')), 'group-detail')                            //车间操作




const Stock = r => require.ensure([], () => r(require('components/material/stock.vue')), 'group-detail')
const Storage = r => require.ensure([], () => r(require('components/material/storage.vue')), 'group-detail')
const Batch = r => require.ensure([], () => r(require('components/stock/batch.vue')), 'group-detail')
const Suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-detail')

const Process = r => require.ensure([], () => r(require('components/process/operation.vue')), 'group-detail')//'components/process/stock.vue'
const List = r => require.ensure([], () => r(require('components/process/list.vue')), 'group-detail')
const Chart = r => require.ensure([], () => r(require('components/process/chart.vue')), 'group-detail')
const Detail = r => require.ensure([], () => r(require('components/process/detail.vue')), 'group-detail')
const Product = r => require.ensure([], () => r(require('components/process/product.vue')), 'group-detail')     //投产表
const StoresReturned = r => require.ensure([], () => r(require('components/process/storesReturned.vue')), 'group-detail')  //退料
const Transfer = r => require.ensure([], () => r(require('components/process/transfer.vue')), 'group-detail')     //结转

const QtReport = r => require.ensure([], () => r(require('components/process/qtReport.vue')), 'group-detail')   //质检
const QcReport = r => require.ensure([], () => r(require('components/process/qcReport.vue')), 'group-detail')   //送检
const FgbReport = r => require.ensure([], () => r(require('components/process/fgbReport.vue')), 'group-detail') //fgb质检
const Tool = r => require.ensure([], () => r(require('components/process/tool.vue')), 'group-detail')           //工具
const Event = r => require.ensure([], () => r(require('components/process/event.vue')), 'group-detail')         //事件
const Repair = r => require.ensure([], () => r(require('components/process/repair.vue')), 'group-detail')       //维修记录
const SpotReport = r => require.ensure([], () => r(require('components/process/spotReport.vue')), 'group-detail')//点检记录
const Parameter = r => require.ensure([], () => r(require('components/process/parameter.vue')), 'group-detail') //工艺参数

const Trace = r => require.ensure([], () => r(require('components/trace/trace.vue')), 'group-detail')
const Track = r => require.ensure([], () => r(require('components/track/track.vue')), 'group-detail')

Vue.use(VueRouter)
// 定义路由
const routes = [  
  {                                     //仓库操作                                              
    path: '/warehouse',                 
    component: Warehouse,
    meta: {
    	title: 'warehouse',
    	keepAlive: false
    }
  },{                                   //车间操作            
    path: '/workshop',                                    
    component: Workshop,
    meta: {
    	title: 'workshop',
    	keepAlive: false
    }
  },{                                   //条码管理
    path: '/barcodeManage',                           
    component: BarcodeManage,
    meta: {
    	title: 'barcodeManage',
    	keepAlive: false
    }
  },{                                   //物料
    path: '/stock',                           
    component: Stock,
    children: [{
      path: '',
      component: Storage,
      meta: {
      	title: 'storage'
      }
    },{
      path: 'batch',
      component: Batch,
      meta: {
      	title: 'batch'
      }
    },{
      path: 'restrain',
      component: Suspicious,
      meta: {
      	title: 'restrain'
      }
    }]
  },{                                   //工序
    path: '/process', 
    component: Process,
    children: [{
      path: 'chart',
      component: Chart,
      meta: {
      	title: 'chart',
      	keepAlive: true
      }
    },{
      path: 'detail',
      component: Detail,
      meta: {
      	title: 'detail',
      	keepAlive: false
      }
    },{//投产表
      path: 'product',
      component: Product,
      meta: {
      	title: 'product',
      	keepAlive: true
      }
    },{//退料
      path: 'storesReturned',
      component: StoresReturned,
      meta: {
      	title: 'storesReturned',
      	keepAlive: false
      }
    },{//结转
      path: 'transfer',
      component: Transfer,
      meta: {
      	title: 'transfer',
      	keepAlive: false
      }
    },{//质检
      path: 'qtReport',
      component: QtReport,
      meta: {
      	title: 'qtReport',
      	keepAlive: false
      }
    },{//送检
      path: 'qcReport',
      component: QcReport,
      meta: {
      	title: 'qcReport',
      	keepAlive: false
      }
    },{//fgb
      path: 'fgbReport',
      component: FgbReport,
      meta: {
      	title:'fgbReport',
      	keepAlive: false
      }
    },{//工具
      path: 'tool',
      component: Tool,
      meta: {
      	title: 'tool',
      	keepAlive: false
      }
    },{//事件
      path: 'event',
      component: Event,
      meta: {
      	title: 'event',
      	keepAlive: false
      }
    },{//维修记录
      path: 'repair',
      component: Repair,
      meta:{
      	title: 'repair',
      	keepAlive: false
      }
    },{//点检记录
      path: 'spotReport',
      component: SpotReport,
      meta: {
      	title: 'spotReport',
      	keepAlive: false
      }
    },{//工艺参数
      path: 'parameter',
      component: Parameter,
      meta: {
      	title: 'parameter',
      	keepAlive: false
      }
    },{//遏制
      path: 'restrain',
      component: Suspicious,
      meta: {
      	title: 'restrain',
      	keepAlive: false
      }
    }]
  },
  { path: '/trace_up', component: Trace },
  { path: '/trace_down', component: Track }
]

// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  routes // （缩写）相当于 routes: routes
})

Vue.use(Vuex)

// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import { loginModule } from 'assets/js/loginStore.js'

// 引用工厂配置模块
// import { customModule } from 'assets/js/customStore.js'
// 引用工厂定制模块
import { factoryModule } from 'assets/js/factoryStore.js'
// 应用版本信息模块
import { versionModule } from 'assets/js/versionStore.js'

Vue.prototype.$register = loginFn

// 定义统一状态。
const store = new Vuex.Store({
  modules: {
    loginModule,
    // customModule,
    factoryModule,
    versionModule
  },
  state: {
    key: "",
    root: [],
    chrome: /chrome/i.test(navigator.userAgent),
    type: "",
    // 
    fullscreen: false,
    treeFullscreen: true,
    // 原始树数据。
    rawData: [],
    resize: 0,
    resizeY: 0,
    // 高亮的数据。
    highted: [],
    // 存入 nodeType
    nodeType: null,
    // 存入 detailInfos
    detailInfos: [],
    // 点击次数
    clickNum: 0,
    // 记录tab改变
    activeTabChange: 'product'
  },
  mutations: {
  	// 记录tab改变事件。
  	updateTabChange(state, payload) {
  		state.activeTabChange = payload.key
  	},
    // 记录点击次数，用于刷新路由
    updateNum (state, payload) {
      state.clickNum ++
    },
    // 存入 nodeType
    updateNodeType (state, payload) {
      state.nodeType = payload.nodeType;
    },
    // 存入 detailInfos
    updateDetailInfos (state, payload) {
      state.detailInfos = payload.detailInfos;
    },  
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
    // 更新左右拖拽事件
    updateResize (state, payload) {
      state.resize = payload.key;
    },
    // 更新上下拖拽事件
    updateResizeY (state, payload) {
      state.resizeY = payload.key;
    },
    updateHeighted(state, payload) {
    	state.highted = payload.data
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