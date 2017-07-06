import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import App from './app.vue'
import axios from 'axios'
import $ from 'jquery'

import 'assets/css/reset.css'
import 'assets/css/common.css'
import 'assets/css/icon.less'
import 'assets/js/html2canvas.js'
import 'assets/js/global.js'

Vue.use(ElementUI)
Vue.prototype.$ajax = axios;

var vm = new Vue({
	el: '#app',
	render: h => h(App)
});
