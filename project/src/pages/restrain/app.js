import Vue from 'vue'
import VueRouter from 'vue-router'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import App from './app.vue'
import axios from 'axios'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'
import 'assets/js/global.js'

Vue.use(VueRouter)
Vue.use(ElementUI)
Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

const list = r => require.ensure([], () => r(require('components/restrain/list.vue')), 'group-datail')
const suspicious = r => require.ensure([], () => r(require('components/restrain/suspicious.vue')), 'group-datail')

// 定义路由
const routes = [
  { path: '/list', component: list },
  { path: '/', component: suspicious }
]

// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
  routes // （缩写）相当于 routes: routes
})


var vm = new Vue({
	el: '#app',
	router,
	render: h => h(App)
});
