import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import App from './app.vue'
import axios from 'axios'

import 'assets/css/reset.css'
import 'assets/css/common.less'
import 'assets/js/global.js'
import 'babel-polyfill'

Vue.use(ElementUI)

Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

new Vue({
  el: '#app',
  render: h => h(App)
})
