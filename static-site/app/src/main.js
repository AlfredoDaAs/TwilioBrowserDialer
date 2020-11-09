import Vue from 'vue'
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
import VueGoodTablePlugin from 'vue-good-table';
import Vuelidate from 'vuelidate'

import App from './App.vue'
import router from './router'
import store from './store'

import '@/assets/scss/custom.scss'

// import the styles
import 'vue-good-table/dist/vue-good-table.css'

Vue.use(Vuelidate)

Vue.use(VueGoodTablePlugin);

// Install BootstrapVue
Vue.use(BootstrapVue)
// Optionally install the BootstrapVue icon components plugin
Vue.use(IconsPlugin)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
