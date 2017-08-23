import Vue from 'vue'
import VueRouter from 'vue-router'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import App from './app.vue'
import axios from 'axios'
import echarts  from 'echarts'

import 'babel-polyfill'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'
import 'assets/js/global.js'

Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

// 添加echarts。
Vue.prototype.$echarts = echarts;

const list = r => require.ensure([], () => r(require('components/restrain/list.vue')), 'group-detail')
const Suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-detail')
const Chart = r => require.ensure([], () => r(require('components/restrain/chart.vue')), 'group-detail')

const Process = r => require.ensure([], () => r(require('components/process/stock.vue')), 'group-detail')
const Product = r => require.ensure([], () => r(require('components/process/product.vue')), 'group-detail')     //投产表
const QtReport = r => require.ensure([], () => r(require('components/process/qtReport.vue')), 'group-detail')   //质检
const QcReport = r => require.ensure([], () => r(require('components/process/qcReport.vue')), 'group-detail')   //送检检
const FgbReport = r => require.ensure([], () => r(require('components/process/fgbReport.vue')), 'group-detail') //fgb质检
const Tool = r => require.ensure([], () => r(require('components/process/tool.vue')), 'group-detail')           //工具
const Event = r => require.ensure([], () => r(require('components/process/event.vue')), 'group-detail')         //事件
const Repair = r => require.ensure([], () => r(require('components/process/repair.vue')), 'group-detail')       //维护记录


// 定义路由
const routes = [
  { path: '/list/:key', component: list },
  { path: '/suspicious/0/', component: Suspicious },
  { path: '/suspicious/1/', component: Chart },  // 设备查询
  { 
    path: '/process', 
    component: Process,
    children: [{
      path: '',
      component: Chart
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
  }
]









// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  // base:'/restrain/',
  // mode: 'history',
  routes // （缩写）相当于 routes: routes
})


var vm = new Vue({
	el: '#app',
	router,
	render: h => h(App)
});
