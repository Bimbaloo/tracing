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
const suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-detail')
const chart = r => require.ensure([], () => r(require('components/restrain/chart.vue')), 'group-detail')


// 定义路由
const routes = [
  { path: '/list/:key', component: list },
  { path: '/suspicious/0/', component: suspicious },
  { path: '/suspicious/1/', component: chart }  // 设备查询
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
