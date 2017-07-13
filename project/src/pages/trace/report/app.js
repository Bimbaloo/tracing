import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import App from './app.vue'
import axios from 'axios'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/js/global.js'

Vue.use(ElementUI)

Vue.prototype.$ajax = axios;

new Vue({
  el: '#app',
  render: h => h(App)
})