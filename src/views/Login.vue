<script setup>
import { reactive } from 'vue'
import { getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'
import { useAllDataStore } from '@/stores/index.js'

const { proxy } = getCurrentInstance()
const router = useRouter()
const allDataStore = useAllDataStore()

const loginForm = reactive({
  username: '',
  password: ''
})

// 登录
const login = async () => {
  const res = await proxy.$api.getMenu(loginForm)
  if (res) {
    allDataStore.updateMenuList(res.menuList)
    allDataStore.state.token = res.token
    // console.log(router.getRoutes())
    // 解决旧账号独有路由会"残留"的问题
    router.getRoutes().forEach((item) => {
      if (item.name === 'main' || item.name === 'login' || item.name === '404')
        return
      router.removeRoute(item.name)
    })
    // 执行添加路由的方法，并传入router
    allDataStore.addMenu(router)
    router.push('/home')
  }
}
</script>
<template>
  <div class="body-login">
    <el-form :model="loginForm" class="login-container">
      <h1>欢迎登录</h1>
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="loginForm.username"
          placeholder="请输入用户名"
        ></el-input>
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input
          v-model="loginForm.password"
          placeholder="请输入密码"
          type="password"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<style lang="less" scoped>
.body-login {
  width: 100%;
  height: 100%;
  background-image: url('../assets/images/background.png');
  background-size: 100%;
  overflow: hidden;
}
.login-container {
  width: 400px;
  background-color: #fff;
  border: 1px solid #eaeaea;
  border-radius: 15px;
  padding: 15px;
  padding: 35px 35px 15px 35px;
  box-shadow: 0 0 25px #cacaca;
  margin: 250px auto;
  h1 {
    text-align: center;
    margin-bottom: 20px;
    color: #505450;
  }
  :deep(.el-form-item__content) {
    justify-content: center;
  }
}
</style>
