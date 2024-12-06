/* eslint-disable */
import Vue from 'vue'
import VueRouter from 'vue-router'
import NetworkTest from '@/views/NetworkTest.vue'
import JsonFormat from '@/views/JsonFormat.vue'
import TimestampConverter from '@/views/TimestampConverter.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/json-format'
  },
  {
    path: '/json-format',
    name: 'JsonFormat',
    component: JsonFormat
  },
  {
    path: '/timestamp',
    name: 'TimestampConverter',
    component: TimestampConverter
  },
  {
    path: '/network-test',
    name: 'NetworkTest',
    component: NetworkTest
  }
]

const router = new VueRouter({
  routes
})

export default router
// ... 