import Vue from 'vue'
import App from './app.vue'
import 'babel-polyfill'

var vm = new Vue({
	el: '#app',
	render: h => h(App)
});
