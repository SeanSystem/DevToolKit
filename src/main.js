/* eslint-disable */
import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import ECharts from 'vue-echarts/components/ECharts'
import 'echarts/lib/chart/line'
import 'echarts/lib/component/tooltip'
import 'echarts/lib/component/title'
import 'echarts/lib/component/legend'
import 'echarts/lib/component/grid'

Vue.use(ElementUI)
Vue.component('v-chart', ECharts)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  render: h => h(App)
}) 