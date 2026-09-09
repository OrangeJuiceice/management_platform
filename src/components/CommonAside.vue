<script setup>
import { computed } from 'vue'
import { useAllDataStore } from '@/stores/index.js'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// pinia 状态管理获取isCollapse
const allDataStore = useAllDataStore()
const isCollapse = computed(() => allDataStore.state.isCollapse)
// 侧边栏菜单列表
const list = computed(() => allDataStore.state.menuList)
// 无子菜单项
const noChildren = computed(() => {
  return list.value.filter((item) => !item.children)
})
// 有子菜单项
const hasChildren = computed(() => {
  return list.value.filter((item) => item.children)
})
// 切换菜单事件
const changeMenu = (item) => {
  // 调用store中的selectMenu方法
  allDataStore.selectMenu(item)
  // 切换路由
  router.push(item.name)
}
</script>

<template>
  <el-aside :width="isCollapse ? '64px' : '180px'">
    <el-menu
      background-color="#545c64"
      text-color="#fff"
      :collapse="isCollapse"
      :collapse-transition="false"
      :default-active="route.path"
    >
      <h3 v-show="!isCollapse">通用后台管理系统</h3>
      <h3 v-show="isCollapse">后台</h3>
      <el-menu-item
        v-for="item in noChildren"
        :key="item.path"
        :index="item.path"
        @click="changeMenu(item)"
      >
        <el-icon><component :is="item.icon" class="icon" /></el-icon>
        <span>{{ item.label }}</span>
      </el-menu-item>
      <el-sub-menu
        v-for="item in hasChildren"
        :key="item.path"
        :index="item.path"
        @click="changeMenu(item)"
      >
        <template #title>
          <el-icon><component :is="item.icon" class="icon" /></el-icon>
          <span>{{ item.label }}</span>
        </template>
        <el-menu-item-group>
          <el-menu-item
            v-for="subItem in item.children"
            :key="subItem.path"
            :index="subItem.path"
            ><el-icon><component :is="subItem.icon" class="icon" /></el-icon>
            <span>{{ subItem.label }}</span></el-menu-item
          >
        </el-menu-item-group>
      </el-sub-menu>
    </el-menu>
  </el-aside>
</template>
<style scoped lang="less">
.el-menu {
  border-right: none;
  h3 {
    line-height: 48px;
    color: #fff;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
  }
  :deep(.el-menu-item span),
  :deep(.el-sub-menu__title span) {
    white-space: nowrap;
  }
}
.el-aside {
  height: 100%;
  background-color: #545c64;
  overflow: hidden;
}
</style>
