<script setup>
import { ref, computed, getCurrentInstance, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  User,
  CircleCloseFilled,
  WarningFilled,
  BellFilled
} from '@element-plus/icons-vue'

const { proxy } = getCurrentInstance()
const router = useRouter()

// 船员统计数据
const stats = ref({
  total: 0,
  expired: 0,
  urgent: 0,
  warning: 0
})

// 三个证书的过期/临期船员列表
const competencyList = ref([]) // 适任证书
const trainingList = ref([]) // 培训证书
const healthList = ref([]) // 健康证书

// 船员统计卡片配置
const statsCards = computed(() => [
  {
    name: '船员总数',
    value: stats.value.total,
    icon: User,
    color: '#409eff'
  },
  {
    name: '过期证书',
    value: stats.value.expired,
    icon: CircleCloseFilled,
    color: '#f56c6c'
  },
  {
    name: '临期证书',
    value: stats.value.urgent,
    icon: WarningFilled,
    color: '#e6a23c'
  },
  {
    name: '待续期证书',
    value: stats.value.warning,
    icon: BellFilled,
    color: '#409eff'
  }
])

// 获取船员证书到期仪表盘数据
const getStatusList = async () => {
  const res = await proxy.$api.getUserStatusList()

  competencyList.value = res.competencyExpired || []
  trainingList.value = res.trainingExpired || []
  healthList.value = res.healthExpired || []
  stats.value = res.stats || { total: 0, expired: 0, urgent: 0, warning: 0 }
}
// 跳转到船员管理页面
// - name: 按姓名搜索该船员
// - certType + status: 按证书状态过滤（certType: competency/training/health，status: expiring/expired/urgent）
const goToUser = ({ name, certType, status } = {}) => {
  const query = {}
  if (name) query.name = name
  if (certType) query.certType = certType
  if (status) query.status = status
  router.push({ path: '/user', query })
}

onMounted(() => {
  getStatusList()
})
</script>

<template>
  <el-row class="home" :gutter="20">
    <el-col :span="24">
      <!-- 船员统计卡片 -->
      <div class="order">
        <el-card
          :body-style="{ display: 'flex', padding: 0 }"
          v-for="item in statsCards"
          :key="item.name"
        >
          <component
            :is="item.icon"
            class="icons"
            :style="{ background: item.color }"
          ></component>
          <div class="detail">
            <p class="num">{{ item.value }}</p>
            <p class="txt">{{ item.name }}</p>
          </div>
        </el-card>
      </div>
    </el-col>
  </el-row>

  <el-row class="home" :gutter="20">
    <!-- 左侧 -->
    <el-col :span="12" style="margin-top: 5px">
      <!-- 健康证书过期/临期列表 -->
      <el-card class="status-card health-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <span class="title">健康证书 - 过期/临期</span>
            <span class="count">共 {{ healthList.length }} 条</span>
          </div>
        </template>
        <div class="crew-list">
          <div
            v-for="crew in healthList.slice(0, 10)"
            :key="crew.id"
            class="crew-item"
            @click="goToUser({ name: crew.name })"
          >
            <div class="crew-info">
              <span class="name">{{ crew.name }}</span>
              <span class="meta">{{ crew.position }} / {{ crew.ship }}</span>
            </div>
            <div class="crew-expiry">
              <span class="date">{{ crew.expiryDate }}</span>
              <span class="status-tag" :class="crew.status">
                {{ crew.status === 'expired' ? '过期' : '临期' }}
              </span>
            </div>
          </div>
          <div v-if="healthList.length === 0" class="empty">
            暂无过期/临期船员
          </div>
          <div
            v-if="healthList.length > 10"
            class="view-all"
            @click="goToUser({ certType: 'health', status: 'expiring' })"
          >
            查看全部 {{ healthList.length }} 条 →
          </div>
        </div>
      </el-card>
    </el-col>
    <!-- 右侧 -->
    <el-col :span="12" style="margin-top: 5px">
      <!-- 适任证书过期/临期列表 -->
      <el-card class="status-card competency-card">
        <template #header>
          <div class="card-header">
            <span class="title">适任证书 - 过期/临期</span>
            <span class="count">共 {{ competencyList.length }} 条</span>
          </div>
        </template>
        <div class="crew-list">
          <div
            v-for="crew in competencyList.slice(0, 10)"
            :key="crew.id"
            class="crew-item"
            @click="goToUser({ name: crew.name })"
          >
            <div class="crew-info">
              <span class="name">{{ crew.name }}</span>
              <span class="meta">{{ crew.position }} / {{ crew.ship }}</span>
            </div>
            <div class="crew-expiry">
              <span class="date">{{ crew.expiryDate }}</span>
              <span class="status-tag" :class="crew.status">
                {{ crew.status === 'expired' ? '过期' : '临期' }}
              </span>
            </div>
          </div>
          <div v-if="competencyList.length === 0" class="empty">
            暂无过期/临期船员
          </div>
          <div
            v-if="competencyList.length > 10"
            class="view-all"
            @click="goToUser({ certType: 'competency', status: 'expiring' })"
          >
            查看全部 {{ competencyList.length }} 条 →
          </div>
        </div>
      </el-card>
    </el-col>
  </el-row>

  <!-- 培训证书跨左右整行 -->
  <el-row class="home" :gutter="20" style="margin-top: 5px">
    <el-col :span="24">
      <el-card class="status-card training-card">
        <template #header>
          <div class="card-header">
            <span class="title">培训证书 - 过期/临期</span>
            <span class="count">共 {{ trainingList.length }} 条</span>
          </div>
        </template>
        <div class="crew-list">
          <div
            v-for="crew in trainingList.slice(0, 10)"
            :key="crew.id"
            class="crew-item"
            @click="goToUser({ name: crew.name })"
          >
            <div class="crew-info">
              <span class="name">{{ crew.name }}</span>
              <span class="meta">{{ crew.position }} / {{ crew.ship }}</span>
            </div>
            <div class="crew-expiry">
              <span class="date">{{ crew.expiryDate }}</span>
              <span class="status-tag" :class="crew.status">
                {{ crew.status === 'expired' ? '过期' : '临期' }}
              </span>
            </div>
          </div>
          <div v-if="trainingList.length === 0" class="empty">
            暂无过期/临期船员
          </div>
          <div
            v-if="trainingList.length > 10"
            class="view-all"
            @click="goToUser({ certType: 'training', status: 'expiring' })"
          >
            查看全部 {{ trainingList.length }} 条 →
          </div>
        </div>
      </el-card>
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
  .order {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    .el-card {
      width: 24%;
      margin-bottom: 20px;
    }
    .icons {
      width: 80px;
      height: 80px;
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
  // 证书状态卡片
  .status-card {
    margin-bottom: 20px;
    width: 100%;
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .title {
        font-size: 16px;
        font-weight: bold;
      }
      .count {
        font-size: 13px;
        color: #999;
      }
    }
    &.competency-card {
      :deep(.el-card__header) {
        background: #e3f2fd;
        color: #1565c0;
      }
    }
    &.training-card {
      :deep(.el-card__header) {
        background: #f3e5f5;
        color: #6a1b9a;
      }
    }
    &.health-card {
      :deep(.el-card__header) {
        background: #e8f5e9;
        color: #2e7d32;
      }
    }
  }
  // 船员列表
  .crew-list {
    .crew-item {
      padding: 10px 12px;
      border-bottom: 1px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      transition: background 0.2s;
      &:hover {
        background: #f5f7fa;
      }
      &:last-child {
        border-bottom: none;
      }
      .crew-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
        .name {
          font-size: 14px;
          font-weight: 500;
          color: #303133;
        }
        .meta {
          font-size: 12px;
          color: #909399;
        }
      }
      .crew-expiry {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 4px;
        .date {
          font-size: 13px;
          color: #606266;
        }
      }
    }
    .empty {
      padding: 24px;
      text-align: center;
      color: #909399;
      font-size: 14px;
    }
    .view-all {
      padding: 10px 12px;
      text-align: center;
      color: #409eff;
      font-size: 13px;
      cursor: pointer;
      &:hover {
        background: #f5f7fa;
      }
    }
  }
  // 状态标签（红=过期 / 橙=临期）
  .status-tag {
    display: inline-block;
    padding: 1px 8px;
    border-radius: 10px;
    font-size: 12px;
    line-height: 1.5;
    &.expired {
      background: #ffebee;
      color: #c62828;
      border: 1px solid #ef9a9a;
    }
    &.urgent {
      background: #fff3e0;
      color: #ef6c00;
      border: 1px solid #ffcc80;
    }
  }
}
</style>
