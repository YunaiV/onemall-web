import Vue from 'vue'

import Cookies from 'js-cookie'

import 'normalize.css/normalize.css' // a modern alternative to CSS resets

import Element from 'element-ui'
import './styles/element-variables.scss'
// import enLang from 'element-ui/lib/locale/lang/en'// 如果使用中文语言包请默认支持，无需额外引入，请删除该依赖

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import permission from './directive/permission'

import './icons' // icon
import './permission' // permission control
import './utils/error-log' // error log

import * as filters from './filters' // global filters

import { resetForm } from '@/utils/index'

// Vue 全局方法挂载

/**
 * 重置表单
 */
Vue.prototype.resetForm = function(refName) {
  if (this.$refs[refName]) {
    this.$refs[refName].resetFields()
  }
}

Vue.prototype.messageSuccess = function(message) {
  this.$message({
    type: 'success',
    showClose: true,
    message: message
  })
}

Vue.prototype.messageError = function(message) {
  this.$message({
    type: 'error',
    showClose: true,
    message: message
  })
}

/**
 * If you don't want to use mock-server
 * you want to use MockJs for mock api
 * you can execute: mockXHR()
 *
 * Currently MockJs will be used in the production environment,
 * please remove it before going online ! ! !
 */
if (process.env.NODE_ENV === 'production') {
  const { mockXHR } = require('../mock')
  mockXHR()
}

// 开启权限标签判断，例如说 v-permission="['system:resource:create']"
Vue.use(permission)

Vue.use(Element, {
  size: Cookies.get('size') || 'medium', // set element-ui default size
  // locale: enLang // 如果使用中文，无需设置，请删除
})

// register global utility filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
