import Vue from 'vue';
import VueRouter from 'vue-router';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-green/index.css';
import App from './app.vue';
import axios from 'axios';
import Vuex from 'vuex'

import 'assets/js/global.js'
import 'babel-polyfill'
import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'


Vue.use(VueRouter);
Vue.use(ElementUI);

Vue.prototype.$ajax = axios;

//import query from '../../components/config/query.vue';
import query from '../../components/config/newquery.vue';
import field from '../../components/config/field.vue';
import factory from '../../components/config/factory.vue';

// 定义路由
const routes = [
    { path: '/query', component: query },
    { path: '/field', component: field },
    { path: '/factory', component: factory }
];

// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
    routes // （缩写）相当于 routes: routes
});


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
    edit: false
  },
  mutations: {  
    updateEdit (state, payload) {
      state.edit = payload.key;
    }
  },
  actions: {}
})

new Vue({
    el: '#app',
    router,
    store,
    render: h => h(App)
});
