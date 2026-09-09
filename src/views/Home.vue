<script setup>
import {
  ref,
  shallowRef,
  getCurrentInstance,
  onMounted,
  onUnmounted
} from 'vue'
import * as echarts from 'echarts'
import { xOptions, pieOptions } from '@/utils/echarts'

const { proxy } = getCurrentInstance()

const getImageUrl = (user) => {
  return new URL(`../assets/images/${user}.png`, import.meta.url).href
}
const tableData = ref([])
const countData = ref([])
const orderEchartRef = shallowRef(null)
const userEchartRef = shallowRef(null)
const videoEchartRef = shallowRef(null)
const resizeObserver = shallowRef(null)
let disposed = false

const tableLabel = ref({
  name: '课程',
  todayBuy: '今日购买',
  monthBuy: '本月购买',
  totalBuy: '总购买'
})

// 获取课程购买统计数据
const getTableData = async () => {
  const data = await proxy.$api.getTableData()
  // console.log(data)
  tableData.value = data.tableData
}
// 获取订单统计数据
const getCountData = async () => {
  const data = await proxy.$api.getCountData()
  // console.log(data)
  countData.value = data
}
// 获取并渲染所有图表数据
const getChartData = async () => {
  const { orderData, userData, videoData } = await proxy.$api.getChartData()
  if (disposed) return
  // 对订单统计数据进行x轴和series配置
  xOptions.xAxis.data = orderData.date
  xOptions.series = Object.keys(orderData.data[0]).map((key) => ({
    name: key,
    type: 'line',
    data: orderData.data.map((item) => item[key])
  }))
  // 初始化订单统计数据图表
  orderEchartRef.value = echarts.init(proxy.$refs.orderChartRef)
  // 渲染图表
  orderEchartRef.value.setOption(xOptions)
  if (disposed) return

  // 对用户统计数据进行x轴和series配置
  xOptions.xAxis.data = userData.map((item) => item.date)
  xOptions.series = [
    {
      name: '新增用户',
      type: 'bar',
      data: userData.map((item) => item.new)
    },
    {
      name: '活跃用户',
      type: 'bar',
      data: userData.map((item) => item.active)
    }
  ]
  // 初始化用户统计数据图表
  userEchartRef.value = echarts.init(proxy.$refs.userChartRef)
  // 渲染图表
  userEchartRef.value.setOption(xOptions)
  if (disposed) return

  // 对视频统计数据进行饼状图配置
  pieOptions.series = {
    data: videoData,
    type: 'pie'
  }
  // 初始化视频统计数据图表
  videoEchartRef.value = echarts.init(proxy.$refs.videoChartRef)
  // 渲染图表
  videoEchartRef.value.setOption(pieOptions)
  if (disposed) return

  // 监听页面的变化
  // 如果监听的容器大小发生变化，改变之后，会执行回调函数，重新渲染图表，保持图表的自适应性
  resizeObserver.value = new ResizeObserver(() => {
    orderEchartRef.value?.resize()
    userEchartRef.value?.resize()
    videoEchartRef.value?.resize()
  })

  // 容器存在
  if (proxy.$refs.orderChartRef) {
    resizeObserver.value.observe(proxy.$refs.orderChartRef)
  }
}

onUnmounted(() => {
  disposed = true
  resizeObserver.value?.disconnect()
  resizeObserver.value = null
  orderEchartRef.value?.dispose()
  userEchartRef.value?.dispose()
  videoEchartRef.value?.dispose()
  orderEchartRef.value = null
  userEchartRef.value = null
  videoEchartRef.value = null
})

onMounted(() => {
  getTableData()
  getCountData()
  getChartData()
})
</script>

<template>
  <el-row class="home" :gutter="20">
    <!-- 左侧 -->
    <el-col :span="8" style="margin-top: 20px">
      <!-- 用户信息卡片 -->
      <el-card shadow="hover">
        <div class="user">
          <img :src="getImageUrl('user')" />
          <div class="user-info">
            <p class="username">Admin</p>
            <p class="role">超级管理员</p>
          </div>
        </div>
        <div class="login-info">
          <p>登录时间：<span>2023-08-01 10:00:00</span></p>
          <p>上次登录地点：<span>中国 北京</span></p>
        </div>
      </el-card>
      <!-- 课程购买统计卡片 -->
      <el-card class="table" shadow="hover">
        <el-table :data="tableData">
          <el-table-column
            v-for="(val, key) in tableLabel"
            :key="key"
            :label="val"
            :prop="key"
          ></el-table-column>
        </el-table>
      </el-card>
    </el-col>
    <!-- 右侧 -->
    <el-col :span="16" style="margin-top: 20px">
      <!-- 订单统计卡片 -->
      <div class="order">
        <el-card
          :body-style="{ display: 'flex', padding: 0 }"
          v-for="item in countData"
          :key="item.name"
        >
          <component
            :is="item.icon"
            class="icons"
            :style="{ background: item.color }"
          ></component>
          <div class="detail">
            <p class="num">￥{{ item.value }}</p>
            <p class="txt">{{ item.name }}</p>
          </div>
        </el-card>
      </div>
      <!-- 订单统计图表 -->
      <el-card class="top-echart">
        <div ref="orderChartRef" style="height: 280px"></div>
      </el-card>

      <div class="graph">
        <!-- 用户统计卡片 -->
        <el-card>
          <div ref="userChartRef" style="height: 240px"></div>
        </el-card>
        <!-- 视频统计卡片 -->
        <el-card>
          <div ref="videoChartRef" style="height: 240px"></div>
        </el-card>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped lang="less">
.home {
  // height: 100%;
  // overflow: hidden;
  .user {
    display: flex;
    align-items: center;
    border-bottom: 1px solid #ccc;
    margin-bottom: 20px;
    img {
      width: 150px;
      height: 150px;
      border-radius: 50%;
      margin-right: 40px;
      margin-bottom: 20px;
    }
  }
  .user-info {
    p {
      line-height: 40px;
    }
    .username {
      font-size: 35px;
    }
    .role {
      color: #999;
    }
  }
  .login-info {
    line-height: 30px;
    font-size: 14px;
    color: #999;
    span {
      color: #666;
      margin-left: 60px;
    }
  }
  .table {
    margin-top: 20px;
  }
  .order {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .el-card {
      width: 32%;
      margin-bottom: 20px;
    }
    .icons {
      width: 80px;
      height: 80px;
      // font-size: 30px;
      // text-align: center;
      // line-height: 80px;
      color: #fff;
    }
    .detail {
      margin-left: 15px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      width: 100%;
      text-align: center;
      .num {
        font-size: 30px;
        margin-bottom: 10px;
      }
      .txt {
        font-size: 15px;
        color: #999;
      }
    }
  }
  .graph {
    display: flex;
    justify-content: space-between;
    .el-card {
      width: 48%;
    }
  }
}
</style>
