import { createApp } from 'vue'
import { createPinia } from 'pinia'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { useAllDataStore } from './stores/index.js'

import App from './App.vue'
import router from './router'

import '@/assets/less/index.less'

import './api/mock.js'
import api from './api/api.js'

const app = createApp(App)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.config.globalProperties.$api = api

app.use(createPinia())
// 这个动态路由的方法必须要在usePinia()之后调用，因为这样才能获取到pinia对象
const allDataStore = useAllDataStore()
// 必须在use(router)之前调用，因为如果是刷新，use(router)后执行完会直接跳转路由，所以需要在之前执行动态路由方法
// 刷新页面的时候，从持久化中读取数据赋值给state
allDataStore.addMenu(router, 'refresh')

app.use(router)

app.mount('#app')
