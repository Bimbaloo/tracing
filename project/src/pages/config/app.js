import Vue from 'vue';
import VueRouter from 'vue-router';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-green/index.css';
import App from './app.vue';
import axios from 'axios';

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/css/icon.less'

Vue.use(VueRouter);
Vue.use(ElementUI);

Vue.prototype.$ajax = axios;

//import query from '../../components/config/query.vue';
import query from '../../components/config/newquery.vue';
import field from '../../components/config/field.vue';


// 定义路由
const routes = [
    { path: '/query', component: query },
    { path: '/field', component: field }
];

// 创建 router 实例，然后传 `routes` 配置
const router = new VueRouter({
    routes // （缩写）相当于 routes: routes
});

new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
