<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAllDataStore } from '@/stores'

const allDataStore = useAllDataStore()

const route = useRoute()
const router = useRouter()

// 从store中获取标签列表
const tags = computed(() => allDataStore.state.tags)

// 切换标签事件
const handleMenu = (tag) => {
  // 调用store中的selectMenu方法
  allDataStore.selectMenu(tag)
  // 切换路由
  router.push(tag.name)
}
// 删除标签事件
const handleClose = (tag, index) => {
  // 调用store中的updateTags方法
  allDataStore.updateTags(tag)
  // 只有关闭当前所在页面的标签时，才需要操作
  if (tag.name !== route.name) return
  // console.log(index)
  // console.log(tags.value)
  // 如果删除的是最后一个标签，切换到上一个标签，此时的length已经为更新后的长度，所以和index相等
  if (index === tags.value.length) {
    allDataStore.selectMenu(tags.value[index - 1])
    router.push(tags.value[index - 1].name)
  }
  // 如果删除的不是最后一个标签，则跳转到下一个标签，由于此时tags已经更新了，所以index就是下一个标签的索引
  else {
    allDataStore.selectMenu(tags.value[index])
    // 切换路由
    router.push(tags.value[index].name)
  }
}
</script>

<template>
  <div class="tags">
    <el-tag
      v-for="(tag, index) in tags"
      :key="tag.name"
      :closable="tag.name !== 'home'"
      :effect="route.name === tag.name ? 'dark' : 'plain'"
      @click="handleMenu(tag)"
      @close="handleClose(tag, index)"
    >
      {{ tag.label }}
    </el-tag>
  </div>
</template>

<style scoped lang="less">
.tags {
  margin: 20px 0 0 20px;
}
.el-tag {
  margin-right: 10px;
}
</style>
