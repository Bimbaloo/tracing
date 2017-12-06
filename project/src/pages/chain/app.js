import Vue from 'vue'
import VueRouter from 'vue-router'
import go from 'gojs'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'

import App from './app.vue'
import axios from 'axios'
import Vuex from 'vuex'
import 'babel-polyfill'

import 'assets/js/global.js'
import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'

Vue.use(ElementUI)

Vue.prototype.$ = go.GraphObject.make;
Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;


Vue.use(Vuex) 

// 引用登录模块。
import loginFn from 'assets/js/loginFn.js'
import {loginModule} from 'assets/js/loginStore.js'
// 引用工厂定制模块
import { customModule } from 'assets/js/customStore.js'

Vue.prototype.$register = loginFn;

// 定义统一状态。
const store = new Vuex.Store({
	modules: {
		loginModule,
		customModule
	},
	state: {
		// 编辑状态
		edit: false,
		// 是否全屏显示
		fullscreen: false,
		// 原始数据。
		rawData: {}
	},
	mutations: {
		// 更新编辑状态
		updateEdit(state, payload) {
			state.edit = payload.key;
		},
		// 更新全屏显示。
		updateFullscreen(state, payload) {
			state.fullscreen = payload.key;
		},
		// 更新数据。
		updateData(state, payload) {
			state.rawData = Object.assign(true,{}, payload.data);
		}
	},
	actions: {
	}
})


var vm = new Vue({
	el: '#app',
	store,
	render: h => h(App)
});
