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
const Warehouse = r => require.ensure([], () => r(require('components/warehouse/warehouse.vue')), 'group-detail')                         //仓库操作
const StockTransfer = r => require.ensure([], () => r(require('components/warehouse/stockTransfer.vue')), 'group-detail')                 //库存转储
const StockGains = r => require.ensure([], () => r(require('components/warehouse/stockGains.vue')), 'group-detail')                       //库存损益
const StockAdjustment = r => require.ensure([], () => r(require('components/warehouse/stockAdjustment.vue')), 'group-detail')             //库存调整
const OutWarehouse = r => require.ensure([], () => r(require('components/warehouse/outWarehouse.vue')), 'group-detail')                   //出库
const PutInWarehouse = r => require.ensure([], () => r(require('components/warehouse/putInWarehouse.vue')), 'group-detail')               //入库

/* 条码管理 */
const BarcodeManage = r => require.ensure([], () => r(require('components/barcodeManage/barcodeManage.vue')), 'group-detail')             // 条码管理
const SupplementaryMaterial = r => require.ensure([], () => r(require('components/barcodeManage/supplementaryMaterial.vue')), 'group-detail')     // 补料                 
const EmptyContainer = r => require.ensure([], () => r(require('components/barcodeManage/emptyContainer.vue')), 'group-detail')           // 容器清空                 
const BarcodeBind = r => require.ensure([], () => r(require('components/barcodeManage/barcodeBind.vue')), 'group-detail')                 // 条码绑定                 

/* 车间操作 */
const Workshop = r => require.ensure([], () => r(require('components/workshop/workshop.vue')), 'group-detail')                            //车间操作
const NewProcess = r => require.ensure([], () => r(require('components/workshop/process.vue')), 'group-detail')                              //工序
const CarryOver = r => require.ensure([], () => r(require('components/workshop/carryOver.vue')), 'group-detail')                          //结转
const ReturnMaterial = r => require.ensure([], () => r(require('components/workshop/returnMaterial.vue')), 'group-detail')                //退料
const AdjustableShop = r => require.ensure([], () => r(require('components/workshop/adjustableShop.vue')), 'group-detail')                //车间调整
const ReworkInbound = r => require.ensure([], () => r(require('components/workshop/reworkInbound.vue')), 'group-detail')                  //返工入站
const ReworkOutbound = r => require.ensure([], () => r(require('components/workshop/reworkOutbound.vue')), 'group-detail')                //返工出站



const Stock = r => require.ensure([], () => r(require('components/material/stock.vue')), 'group-detail')
const Storage = r => require.ensure([], () => r(require('components/material/storage.vue')), 'group-detail')
const Batch = r => require.ensure([], () => r(require('components/stock/batch.vue')), 'group-detail')
const Suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-detail')

const Process = r => require.ensure([], () => r(require('components/process/operation.vue')), 'group-detail')//'components/process/stock.vue'
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
const routes = [  
  {                                     //仓库操作                                              
    path: '/warehouse',                 
    component: Warehouse,
    children: [
    {//库存转储
      path: 'stockTransfer',          
      component: StockTransfer,
      meta: {
        title: 'stockTransfer'
      }
    },{//库存损益
      path: 'stockGains',
      component: StockGains,          
      meta: {
        title: 'stockGains'
      }
    },{//库存调整
      path: 'stockAdjustment',
      component: StockAdjustment,     
      meta: {
        title: 'stockAdjustment'
      }
    },{//出库
      path: 'outWarehouse',           
      component: OutWarehouse,         
      meta: {
        title: 'outWarehouse'
      }
    },{//入库
      path: 'putInWarehouse',
      component: PutInWarehouse,       
      meta: {
        title: 'putInWarehouse'
      }
    }]  
  },{                                   //车间操作            
    path: '/workshop',                                    
    component: Workshop,
    children: [
    {//工序
      path: 'newProcess', 
      component: NewProcess,
      meta: {
      	title: 'newProcess'
      }
    },{//结转
      path: 'carryOver', 
      component: CarryOver,
      meta: {
      	title: 'carryOver'
      }
    },{//退料
      path: 'returnMaterial', 
      component: ReturnMaterial,
      meta: {
      	title: 'returnMaterial'
      }
    },{//车间调整
      path: 'adjustableShop', 
      component: AdjustableShop,
      meta: {
      	title: 'adjustableShop'
      }
    },{//返工入站
      path: 'reworkInbound', 
      component: ReworkInbound,
      meta: {
      	title: 'reworkInbound'
      }
    },{//返工出站
      path: 'reworkOutbound', 
      component: ReworkOutbound,
      meta: {
      	title: 'reworkOutbound'
      }
    }]
  },{                                   //条码管理
    path: '/barcodeManage',                           
    component: BarcodeManage,
    children: [
    {//补料
      path: 'supplementaryMaterial',
      component: SupplementaryMaterial,
      meta: {
      	title: 'supplementaryMaterial'
      }
    },{//容器清空
      path: 'emptyContainer',
      component: EmptyContainer,
      meta: {
      	title: 'emptyContainer'
      }
    },{//条码绑定
      path: 'barcodeBind',
      component: BarcodeBind,
      meta: {
      	title: 'barcodeBind'
      }
    }]
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
    // 存入 nodeType
    nodeType: null,
    // 存入 detailInfos
    detailInfos: []
  },
  mutations: {
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