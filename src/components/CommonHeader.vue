<script setup>
import { useAllDataStore } from '@/stores/index.js'
const allDataStore = useAllDataStore()
import { useRouter } from 'vue-router'
import { computed } from 'vue'

const router = useRouter()

// 获取用户头像的URL地址
const getImageUrl = (user) => {
  return new URL(`../assets/images/${user}.png`, import.meta.url).href
}

// 点击菜单按钮，切换菜单是否折叠的状态
const handleCollapse = () => {
  allDataStore.state.isCollapse = !allDataStore.state.isCollapse
}

// 退出登录
const handleLogout = () => {
  allDataStore.clean()
  // 退出登录后，跳转到登录页
  router.push('/login')
}

const current = computed(() => allDataStore.state.currentMenu)
</script>

<template>
  <div class="header">
    <!-- 左侧菜单 -->
    <div class="l-content">
      <el-button @click="handleCollapse">
        <component :is="'menu'" class="icons" />
      </el-button>
      <!-- 面包屑 -->
      <el-breadcrumb separator="/" class="bread">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item v-if="current" :to="current.path">{{
          current.label
        }}</el-breadcrumb-item>
      </el-breadcrumb>
    </div>
    <!-- 右侧用户头像 -->
    <div class="r-content">
      <el-dropdown>
        <span>
          <!-- 定义一个URL对象地址，这里是传入图片的名称 -->
          <img :src="getImageUrl('user')" class="user"
        /></span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item>个人中心</el-dropdown-item>
            <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<style scoped lang="less">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: 100%;
}
.icons {
  width: 20px;
  height: 20px;
}
.r-content {
  .user {
    width: 40px;
    height: 40px;
    border-radius: 50%;
  }
}
.l-content {
  display: flex;
  align-items: center;
  .el-button {
    margin-right: 20px;
  }
  // 样式穿透+强制覆盖
  :deep(.bread span) {
    color: #fff !important;
    cursor: pointer !important;
  }
}
</style>
