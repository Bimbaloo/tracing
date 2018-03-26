import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'

import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-green/index.css'
import 'theme/index.css'
import App from './app.vue'
import axios from 'axios'
import echarts from 'echarts'

import 'babel-polyfill'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'
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
// 引用工厂定制模块
import {
  factoryModule
} from 'assets/js/factoryStore.js'

Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.prototype.$ajax = axios
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {
  'params': oParams
})
Vue.prototype.$post = axios.post

// 添加echarts。
Vue.prototype.$echarts = echarts

const list = r => require.ensure([], () => r(require('components/restrain/list.vue')), 'group-detail')
const Suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-detail')
const MoldCode = r => require.ensure([], () => r(require('components/restrain/moldCode.vue')), 'group-detail')  // 根据模号遏制
const qualityControl = r => require.ensure([], () => r(require('components/restrain/qualityControl.vue')), 'group-detail')    // 根据质检单遏制
const workOrders = r => require.ensure([], () => r(require('components/restrain/workOrders.vue')), 'group-detail')    // 根据工单遏制
const equipment = r => require.ensure([], () => r(require('components/restrain/equipment.vue')), 'group-detail')    // 根据设备+时间遏制
const batchNo = r => require.ensure([], () => r(require('components/restrain/batchNo.vue')), 'group-detail')    // 根据物料+批次遏制
const Chart = r => require.ensure([], () => r(require('components/restrain/chart.vue')), 'group-detail')
const Detail = r => require.ensure([], () => r(require('components/process/detail.vue')), 'group-detail')

const Process = r => require.ensure([], () => r(require('components/process/stock.vue')), 'group-detail')
const Product = r => require.ensure([], () => r(require('components/process/product.vue')), 'group-detail') // 投产表
const QtReport = r => require.ensure([], () => r(require('components/process/qtReport.vue')), 'group-detail') // 质检
const QcReport = r => require.ensure([], () => r(require('components/process/qcReport.vue')), 'group-detail') // 送检检
const FgbReport = r => require.ensure([], () => r(require('components/process/fgbReport.vue')), 'group-detail') // fgb质检
const Tool = r => require.ensure([], () => r(require('components/process/tool.vue')), 'group-detail') // 工具
const Event = r => require.ensure([], () => r(require('components/process/event.vue')), 'group-detail') // 事件
const Repair = r => require.ensure([], () => r(require('components/process/repair.vue')), 'group-detail') // 维护记录
const SpotReport = r => require.ensure([], () => r(require('components/process/spotReport.vue')), 'group-detail') // 点检记录
const Parameter = r => require.ensure([], () => r(require('components/process/parameter.vue')), 'group-detail') // 工艺参数

// 定义路由
const routes = [
  {
    path: '/suppressList/:key',
    component: list
  }, // 遏制列表
  {
    path: '/suppress/1/',
    component: Suspicious, // 可疑品列表
    meta: {
      title: 'restrain'
    }
  },
  { // 设备查询
    path: '/suppress/2/',
    redirect: '/process'
  },
  { // 设备查询
    path: '/process',
    component: Process,
    children: [{
      path: '',
      component: Chart, // List
      meta: {
        title: 'chart'
      }
    }, {
      path: 'detail',
      component: Detail,
      meta: {
        title: 'detail'
      }
    }, {
      path: 'product',
      component: Product,
      meta: {
        title: 'product'
      }
    }, { // 质检
      path: 'qtReport',
      component: QtReport,
      meta: {
        title: 'qtReport'
      }
    }, { // 送检
      path: 'qcReport',
      component: QcReport,
      meta: {
        title: 'qcReport'
      }
    }, { // fgb
      path: 'fgbReport',
      component: FgbReport,
      meta: {
        title: 'fgbReport'
      }
    }, { // 工具
      path: 'tool',
      component: Tool,
      meta: {
        title: 'tool'
      }
    }, { // 事件
      path: 'event',
      component: Event,
      meta: {
        title: 'event'
      }
    }, { // 维修记录
      path: 'repair',
      component: Repair,
      meta: {
        title: 'repair'
      }
    }, { // 点检记录
      path: 'spotReport',
      component: SpotReport,
      meta: {
        title: 'spotReport'
      }
    }, { // 工艺参数
      path: 'parameter',
      component: Parameter,
      meta: {
        title: 'parameter'
      }
    }, { // 遏制
      path: 'restrain',
      component: Suspicious,
      meta: {
        title: 'restrain'
      }
    }]
  },
  {// 模号查询
    path: '/suppress/3',
    redirect: '/moldCode'
  },
  {// 模号查询--重定向到正确位置
    path: '/moldCode',
    component: MoldCode,
    title: 'moldCode'
  },
  {
    path: '/suppress/4/',
    component: Suspicious, // 可疑品列表
    meta: {
      title: 'restrain',
      type: 'suspiciouByBarcode'
    }
  },
  { // 根据质检单查询
    path: '/qtSuppress/1',
    redirect: '/qualityControl'
  },
  {// 模号查询--重定向到正确位置--质检单查询
    path: '/qualityControl',
    component: qualityControl,
    title: 'qualityControl'
  },
  { // 根据工单查询
    path: '/qtSuppress/2',
    redirect: '/workOrders'
  },
  {// 模号查询--重定向到正确位置--工单查询
    path: '/workOrders',
    component: workOrders,
    title: 'workOrders'
  },
  { // 根据设备+时间查询
    path: '/qtSuppress/3',
    redirect: '/equipment'
  },
  {// 模号查询--重定向到正确位置--根据质检批次
    path: '/equipment',
    component: equipment,
    title: 'equipment'
  },
  { // 根据质检批次
    path: '/qtSuppress/4',
    redirect: '/batchNo'
  },
  {// 根据质检批次--重定向到正确位置--根据质检批次
    path: '/batchNo',
    component: batchNo,
    title: 'batchNo'
  }
]

// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  // base:'/restrain/',
  // mode: 'history',
  routes // （缩写）相当于 routes: routes
})

Vue.use(Vuex)

Vue.prototype.$register = loginFn

const store = new Vuex.Store({
  modules: {
    loginModule,
    // customModule
    factoryModule,
    versionModule
  }
})

window.vm = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
