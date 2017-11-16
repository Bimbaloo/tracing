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
/* 仓库操作 */
const Warehouse = r => require.ensure([], () => r(require('components/process/warehouse.vue')), 'group-detail')
const StockTransfer = r => require.ensure([], () => r(require('components/process/stockTransfer.vue')), 'group-detail')               //库存转储
const Varastoonotto = r => require.ensure([], () => r(require('components/process/varastoonotto.vue')), 'group-detail')               //库存收货
const InventoryShipment = r => require.ensure([], () => r(require('components/process/inventoryShipment.vue')), 'group-detail')       //库存发货
const ProducedStorage = r => require.ensure([], () => r(require('components/process/producedStorage.vue')), 'group-detail')           //生产入库
const ProduceShipment = r => require.ensure([], () => r(require('components/process/produceShipment.vue')), 'group-detail')           //生产发料
const ProductionWithdrawal = r => require.ensure([], () => r(require('components/process/productionWithdrawal.vue')), 'group-detail') //生产退料
const SaleRefunding = r => require.ensure([], () => r(require('components/process/saleRefunding.vue')), 'group-detail')               //销售退库
const SaleOutWarehouse = r => require.ensure([], () => r(require('components/process/saleOutWarehouse.vue')), 'group-detail')         //销售出库
const PurchaseStorage = r => require.ensure([], () => r(require('components/process/purchaseStorage.vue')), 'group-detail')           //采购入库
const PurchasingWithdrawal = r => require.ensure([], () => r(require('components/process/purchasingWithdrawal.vue')), 'group-detail') //采购退库
const StockGains = r => require.ensure([], () => r(require('components/process/stockGains.vue')), 'group-detail')                     //库存损益
const StockAdjustment = r => require.ensure([], () => r(require('components/process/stockAdjustment.vue')), 'group-detail')           //库存调整
const TransferStorage = r => require.ensure([], () => r(require('components/process/transferStorage.vue')), 'group-detail')           //调拨入库
const TransferOutWarehouse = r => require.ensure([], () => r(require('components/process/transferOutWarehouse.vue')), 'group-detail') //调拨出库
const ProductDelivery = r => require.ensure([], () => r(require('components/process/ProductDelivery.vue')), 'group-detail')           //成品发货


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
const Repair = r => require.ensure([], () => r(require('components/process/repair.vue')), 'group-detail')       //维修记录
const SpotReport = r => require.ensure([], () => r(require('components/process/spotReport.vue')), 'group-detail')//点检记录
const Parameter = r => require.ensure([], () => r(require('components/process/parameter.vue')), 'group-detail') //工艺参数

const Trace = r => require.ensure([], () => r(require('components/trace/trace.vue')), 'group-detail')
const Track = r => require.ensure([], () => r(require('components/track/track.vue')), 'group-detail')

Vue.use(VueRouter)
// 定义路由
const routes = [{
    path: '/warehouse', 
    component: Warehouse,
    children: [{
      path: 'stockTransfer',
      component: StockTransfer,
      meta: {
        title: 'stockTransfer'
      }
    },{
      path: 'varastoonotto',
      component: Varastoonotto,
      meta: {
        title: 'varastoonotto'
      }
    },{
      path: 'inventoryShipment',
      component: InventoryShipment,
      meta: {
        title: 'inventoryShipment'
      }
    },{
      path: 'producedStorage',
      component: ProducedStorage,
      meta: {
        title: 'producedStorage'
      }
    },{
      path: 'produceShipment',
      component: ProduceShipment,
      meta: {
        title: 'produceShipment'
      }
    },{
      path: 'productionWithdrawal',
      component: ProductionWithdrawal,
      meta: {
        title: 'productionWithdrawal'
      }
    },{
      path: 'saleRefunding',
      component: SaleRefunding,
      meta: {
        title: 'saleRefunding'
      }
    },{
      path: 'saleOutWarehouse',
      component: SaleOutWarehouse,
      meta: {
        title: 'saleOutWarehouse'
      }
    },{
      path: 'purchaseStorage',
      component: PurchaseStorage,
      meta: {
        title: 'purchaseStorage'
      }
    },{
      path: 'purchasingWithdrawal',
      component: PurchasingWithdrawal,
      meta: {
        title: 'purchasingWithdrawal'
      }
    },{
      path: 'stockGains',
      component: StockGains,
      meta: {
        title: 'stockGains'
      }
    },{
      path: 'stockAdjustment',
      component: StockAdjustment,
      meta: {
        title: 'StockAdjustment'
      }
    },{
      path: 'transferStorage',
      component: TransferStorage,
      meta: {
        title: 'transferStorage'
      }
    },{
      path: 'transferOutWarehouse',
      component: TransferOutWarehouse,
      meta: {
        title: 'transferOutWarehouse'
      }
    },{
      path: 'ProductDelivery',
      component: ProductDelivery,
      meta: {
        title: 'ProductDelivery'
      }
    }]
  },{ 
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
  },{ 
    path: '/process', 
    component: Process,
    children: [{
      path: '',
      component: Chart,//List
      meta: {
      	title: 'chart'
      }
    },{
      path: 'detail',
      component: Detail,
      meta: {
      	title: 'detail'
      }
    },{
      path: 'product',
      component: Product,
      meta: {
      	title: 'product'
      }
    },{//质检
      path: 'qtReport',
      component: QtReport,
      meta: {
      	title: 'qtReport'
      }
    },{//送检
      path: 'qcReport',
      component: QcReport,
      meta: {
      	title: 'qcReport'
      }
    },{//fgb
      path: 'fgbReport',
      component: FgbReport,
      meta: {
      	title:'fgbReport'
      }
    },{//工具
      path: 'tool',
      component: Tool,
      meta: {
      	title: 'tool'
      }
    },{//事件
      path: 'event',
      component: Event,
      meta: {
      	title: 'event'
      }
    },{//维修记录
      path: 'repair',
      component: Repair,
      meta:{
      	title: 'repair'
      }
    },{//点检记录
      path: 'spotReport',
      component: SpotReport,
      meta: {
      	title: 'spotReport'
      }
    },{//工艺参数
      path: 'parameter',
      component: Parameter,
      meta: {
      	title: 'parameter'
      }
    },{//遏制
      path: 'restrain',
      component: Suspicious,
      meta: {
      	title: 'restrain'
      }
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

// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import {loginModule} from 'assets/js/loginStore.js'

Vue.prototype.$register = loginFn;
// 定义统一状态。
const store = new Vuex.Store({
  modules: {
    loginModule
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
    opType: null,
    urls: {
      "op_category": "api/v1/trace/operation-detail/stock/by-id",               //仓库操作
      "op_category": "api/v1/trace/operation-detail/workshop/by-id",            //车间操作
      "op_category": "api/v1/trace/operation-detail/barcode-management/by-id",  //条码管理
      "op_category": "api/v1/trace/operation-detail/inout/by-id",               //投产相关(投入，产出，结转，退料)
    },
    url: '',            // 实际请求api
    operationIdList: [] // 仓库操作,车间操作和条码管理前端传入数据
  },
  mutations: {
    // 保存 operationIdList  仓库操作,车间操作和条码管理前端传入数据
    updateOperationIdList (state, payload) {
      state.operationIdList = payload.operationIdList;
    },
    // 根据 op_category 获取需要的url
    updateUrl (state, payload) {
      state.url = state.urls[payload.op_category];
    },
    // 存入 opType
    updateOpType (state, payload) {
      state.opType = payload.opType;
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