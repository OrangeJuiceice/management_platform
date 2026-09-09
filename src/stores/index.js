import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

function initState() {
  return {
    // 侧边栏是否折叠
    isCollapse: false,
    // 标签列表
    tags: [
      {
        path: '/home',
        name: 'home',
        label: '首页',
        icon: 'home'
      }
    ],
    // 当前选中的菜单
    currentMenu: null,
    // 菜单列表
    menuList: [],
    token: '',
    // 路由列表
    routeList: []
  }
}

export const useAllDataStore = defineStore('allData', () => {
  const state = ref(initState())

  // 切换菜单事件
  const selectMenu = (val) => {
    // 如果是首页，当前选中的菜单设为null，因为首页tag是默认存在的，不需要添加到标签列表中
    if (val.name === 'home') {
      state.value.currentMenu = null
    } else {
      // 如果不是首页，当前选中的菜单设为val
      state.value.currentMenu = val
    }
    // 如果标签列表中不存在当前选中的菜单，添加到标签列表中
    const index = state.value.tags.findIndex((item) => item.name === val.name)
    index === -1 ? state.value.tags.push(val) : ''
  }

  // 删除tag事件
  const updateTags = (tag) => {
    // 如果标签列表中存在当前选中的菜单，删除它
    const index = state.value.tags.findIndex((item) => item.name === tag.name)
    state.value.tags.splice(index, 1)
  }

  // 更新菜单列表事件
  const updateMenuList = (val) => {
    state.value.menuList = val
  }

  // 动态路由方法
  const addMenu = (router, type) => {
    // 如果是刷新的时候执行的，就从持久化中读取数据赋值给state
    if (type === 'refresh') {
      // 需要判断一下是否有数据，因为addMenu需要放到main.js中执行，第一次加载项目的时候，会执行，但是没有持久化数据，所以不是刷新操作，直接return
      if (localStorage.getItem('store')) {
        state.value = JSON.parse(localStorage.getItem('store'))
        // routeList保存的函数，存储的时候不能解析，其中的值就是null，这里直接重新赋值[]
        state.value.routeList = []
      } else {
        return
      }
    }
    const menu = state.value.menuList
    // **代表0或多个文件夹，*代表文件。就是把views下的文件全部导入
    const module = import.meta.glob('../views/**/*.vue')
    // 菜单格式化后的路由数组
    const routeArr = []
    // 格式化菜单路由
    menu.forEach((item) => {
      // 如果菜单有children
      if (item.children) {
        // 把children遍历格式化
        item.children.forEach((val) => {
          const url = `../views/${val.url}.vue`
          // 通过url取出对应的views组件
          val.component = module[url]
        })
        // 我们只需要为item.children中的菜单添加路由，所以把格式化后的children添加到路由数组中
        routeArr.push(...item.children)
      } else {
        const url = `../views/${item.url}.vue`
        item.component = module[url]
        routeArr.push(item)
      }
    })
    // 遍历routeArr
    routeArr.forEach((item) => {
      //addRoute方法会返回一个函数，执行这个返回的函数会把这个路由删除
      //这里我们把每一次router.addRoute添加路由的返回值收集起来，放到state中的routeList
      //addRoute第一个参数要添加子路由的路由name，第二个是一个路由记录
      state.value.routeList.push(router.addRoute('main', item))
    })
  }

  // 退出登录，重置数据
  const clean = () => {
    // 把保存在routeList里的函数执行，删除路由记录
    // console.log(state.value.routeList)
    state.value.routeList.forEach((item) => item())
    // 重置state的数据
    state.value = initState()
    // 删除本地存储中的数据
    localStorage.removeItem('store')
  }

  // 监听state的变化，当state变化时，持久化存储state
  watch(
    state,
    (newVal) => {
      // 如果变化后的token不存在，代表用户退出，不需要持久化存储state
      if (!newVal.token) return
      // 持久化存储state
      localStorage.setItem('store', JSON.stringify(newVal))
    },
    // 开启深度监听，监听state中的所有属性
    { deep: true }
  )

  return {
    state,
    selectMenu,
    updateTags,
    updateMenuList,
    addMenu,
    clean
  }
})
