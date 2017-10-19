import Vue from 'vue'
import App from './app.vue'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-green/index.css'
import 'babel-polyfill'

Vue.use(ElementUI)

var vm = new Vue({
	el: '#app',
	render: h => h(App)
});
