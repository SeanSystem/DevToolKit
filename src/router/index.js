/* eslint-disable */
import Vue from 'vue'
import VueRouter from 'vue-router'
import CronGenerator from '../views/CronGenerator.vue'
import TimestampConverter from '../views/TimestampConverter.vue'
import JsonFormat from '../views/JsonFormat.vue'
// import NetworkTest from '../views/NetworkTest.vue' // 暂时注释掉网络测试组件

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/cron'
  },
  {
    path: '/cron',
    name: 'CronGenerator',
    component: CronGenerator
  },
  {
    path: '/timestamp',
    name: 'TimestampConverter',
    component: TimestampConverter
  },
  {
    path: '/json',
    name: 'JsonFormat',
    component: JsonFormat
  }
  // 暂时注释掉网络测试路由
  // {
  //   path: '/network',
  //   name: 'NetworkTest',
  //   component: NetworkTest
  // }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
// ... 