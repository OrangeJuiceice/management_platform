import { createRouter, createWebHashHistory } from 'vue-router'
import { useAllDataStore } from '@/stores/index.js'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      redirect: '/home',
      component: () => import('@/views/Main.vue'),
      children: [
        // {
        //   path: '/home',
        //   name: 'home',
        //   component: () => import('@/views/Home.vue')
        // },
        // {
        //   path: '/user',
        //   name: 'user',
        //   component: () => import('@/views/User.vue')
        // },
        // {
        //   path: '/mall',
        //   name: 'mall',
        //   component: () => import('@/views/Mall.vue')
        // }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/Login.vue')
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/404.vue')
    }
  ]
})

const isRoute = (to) => {
  // 检查路由是否存在
  // 如果存在，则返回true
  // 如果不存在，则返回false
  return router.getRoutes().filter((item) => item.name === to.name).length > 0
}

// 路由守卫
router.beforeEach((to) => {
  // 在守卫内部按需获取 store，此时 pinia 已挂载
  const allDataStore = useAllDataStore()
  // 如果要跳转的不是登录页，且token不存在，则跳转到login
  if (to.name !== 'login' && !allDataStore.state.token) {
    return { name: 'login' }
  }
  // 如果要跳转的路由不存在，则跳转到404页面
  if (!isRoute(to)) {
    return { name: '404' }
  }
})

export default router
