import Vue from 'vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import App from './app.vue'
import axios from 'axios'
import $ from 'jquery'
import 'assets/css/reset.css'
import Vuex from 'vuex'

Vue.use(ElementUI)

Vue.prototype.$ajax = axios;
Vue.prototype.$get = (sUrl, oParams) => axios.get(sUrl, {"params": oParams})
Vue.prototype.$post = axios.post;

Vue.use(Vuex) 
// 定义统一状态。
const store = new Vuex.Store({
  state: {
   	edit: false
  },
  mutations: {  
    updateEdit (state, payload) {
      state.edit = payload.key;
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
