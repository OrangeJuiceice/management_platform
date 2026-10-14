<script setup>
import { ref, getCurrentInstance, onMounted, reactive, nextTick } from 'vue'

const tableData = ref([])
const { proxy } = getCurrentInstance()

// 请求用户列表数据
// 计算日期状态：返回状态类名和文案
// 状态分档：>90天有效 / 30~90天即将过期 / 0~30天紧急 / <0天已过期
const getDateStatus = (dateStr) => {
  if (!dateStr) return { className: 'expired', label: '无日期' }
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const diffDays = Math.floor((target - now) / (24 * 60 * 60 * 1000))

  if (diffDays < 0) return { className: 'expired', label: '已过期' }
  if (diffDays < 30) return { className: 'urgent', label: '临期' }
  if (diffDays <= 90) return { className: 'warning', label: '待续期' }
  return { className: 'valid', label: '有效' }
}

const getUserData = async () => {
  const res = await proxy.$api.getUserData(config)
  // 处理性别数据
  tableData.value = res.list.map((item) => ({
    ...item,
    sexLable: Number(item.sex) === 1 ? '男' : '女'
  }))
  // 处理分页数据
  config.total = res.count
  config.page = res.page
}

// 表头
const tableLable = reactive([
  {
    prop: 'name',
    label: '姓名',
    width: '70'
  },
  {
    prop: 'position',
    label: '职务',
    width: '70'
  },
  {
    prop: 'sexLable',
    label: '性别',
    width: '50'
  },
  {
    prop: 'nativePlace',
    label: '籍贯',
    width: '120'
  },
  {
    prop: 'ship',
    label: '所属船只',
    width: '110'
  },
  {
    prop: 'competencyExpiry',
    label: '适任证书有效期至',
    width: '180'
  },
  {
    prop: 'rankLevel',
    label: '等级与职务',
    width: '200',
    className: 'multi-line-cell'
  },
  {
    prop: 'phone',
    label: '手机号码',
    width: '110'
  },
  {
    prop: 'trainingExpiry',
    label: '海船船员培训证书有效期至',
    width: '180'
  },
  {
    prop: 'healthExpiry',
    label: '海船船员健康证书有效期至',
    width: '180'
  }
])

// 搜索表单
const formInline = reactive({
  keyWord: ''
})

// 搜索和分页配置
const config = reactive({
  name: '',
  page: 1
})

// 搜索功能
const handleSearch = () => {
  config.name = formInline.keyWord
  getUserData(config)
}

// 分页功能
const handleChange = (val) => {
  config.page = val
  getUserData(config)
}

// 删除用户
const handleDelete = async (row) => {
  await ElMessageBox.confirm('确认删除吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
  const res = await proxy.$api.deleteUser({
    id: row.id
  })
  console.log(res)
  ElMessage({
    showClose: true,
    message: '删除成功',
    type: 'success'
  })
  getUserData()
}

// 新增用户/编辑用户弹窗组件
const dialogVisible = ref(false)
// 通过设置actino区别新增窗口和编辑窗口
const action = ref('add')
// 新增用户表单数据
const formUser = reactive({
  name: '',
  position: '',
  sex: '',
  nativePlace: '',
  ship: '',
  competencyExpiry: '',
  rankLevel: '',
  phone: '',
  trainingExpiry: '',
  healthExpiry: ''
})

// 新增用户/编辑用户表单校验规则
const rules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  position: [{ required: true, message: '请输入职务', trigger: 'blur' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }],
  nativePlace: [{ required: true, message: '请输入籍贯', trigger: 'blur' }],
  ship: [{ required: true, message: '请输入所属船只', trigger: 'blur' }],
  competencyExpiry: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  rankLevel: [{ required: true, message: '请输入等级与职务', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入手机号码', trigger: 'blur' }],
  trainingExpiry: [
    { required: true, message: '请选择日期', trigger: 'change' }
  ],
  healthExpiry: [{ required: true, message: '请选择日期', trigger: 'change' }]
})

// 新增用户弹窗打开事件
const handleAdd = () => {
  action.value = 'add'
  // 重置 id，避免上次编辑残留
  formUser.id = ''
  dialogVisible.value = true
}

// 对话框右上角的关闭事件
const handleClose = () => {
  proxy.$refs.formRef.resetFields()
  dialogVisible.value = false
}

// 对话框右下角的取消事件
const handleCancel = () => {
  proxy.$refs.formRef.resetFields()
  dialogVisible.value = false
}

// 格式化日期，将日期转换为yyyy-MM-dd格式
const timeFormat = (time) => {
  time = new Date(time)
  const year = time.getFullYear()
  let month = time.getMonth() + 1
  let day = time.getDate()
  month = month < 10 ? '0' + month : month
  day = day < 10 ? '0' + day : day
  return `${year}-${month}-${day}`
}

// 格式化单个日期字段：如果已是 yyyy-MM-dd 就直接用，否则转格式
const formatDateField = (fieldName) => {
  const val = formUser[fieldName]
  if (!val) return
  formUser[fieldName] = /^\d{4}-\d{2}-\d{2}$/.test(val) ? val : timeFormat(val)
}

// 新增用户/编辑用户提交事件
const onSubmit = async () => {
  // 校验表单
  await proxy.$refs.formRef.validate(async (valid) => {
    // 如果校验通过，就提交表单
    if (valid) {
      // 用res接收新增用户或编辑用户接口的返回值
      let res = null
      // 处理 3 个日期字段
      formatDateField('competencyExpiry')
      formatDateField('trainingExpiry')
      formatDateField('healthExpiry')

      if (action.value === 'add') {
        res = await proxy.$api.addUser(formUser)
      } else if (action.value === 'edit') {
        res = await proxy.$api.updateUser(formUser)
      }
      // 如果新增用户或编辑用户成功，就关闭弹窗，重置表单，刷新用户列表
      if (res) {
        dialogVisible.value = false
        proxy.$refs.formRef.resetFields()
        ElMessage({
          showClose: true,
          message: action.value === 'add' ? '添加成功' : '编辑成功',
          type: 'success'
        })
        getUserData()
      }
    }
    // 如果新增用户或编辑用户的校验失败，就提示用户填写完整信息
    else {
      ElMessage({
        showClose: true,
        message: '请填写完整信息',
        type: 'warning'
      })
    }
  })
}

// 编辑用户弹窗打开事件
const handleEdit = (row) => {
  action.value = 'edit'
  dialogVisible.value = true
  // 用formUser接收编辑用户接口的返回值
  //因为在第一次显示弹窗的时候form组件没有加载出来，如果直接对formUser赋值，这个值会作为form表单的初始值
  //所以使用nextTick，赋值的操作在一个微任务中，这样就可以避免在from表单加载之前赋值
  // //这里需要改变sex数据类型，是因为el-option的value有类型的校验
  nextTick(() => {
    Object.assign(formUser, { ...row, sex: '' + row.sex })
  })
}

onMounted(() => {
  getUserData()
})
</script>

<template>
  <div class="user-header">
    <el-button type="primary" @click="handleAdd">新增</el-button>
    <!-- 搜索表单 -->
    <el-form :inline="true" :model="formInline">
      <el-form-item label="请输入">
        <el-input
          placeholder="请输入用户名"
          v-model="formInline.keyWord"
        ></el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </el-form-item>
    </el-form>
  </div>
  <!-- 用户列表表格 -->
  <div class="table">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column
        v-for="item in tableLable"
        :key="item.prop"
        :label="item.label"
        :prop="item.prop"
        :width="item.width ? item.width : '125'"
        :class-name="item.className || ''"
      >
        <template #default="scope">
          <!-- 3 个日期字段：显示日期 + 状态标签 -->
          <span
            v-if="
              ['competencyExpiry', 'trainingExpiry', 'healthExpiry'].includes(
                item.prop
              )
            "
          >
            <span>{{ scope.row[item.prop] }}</span>
            <span
              class="status-tag"
              :class="getDateStatus(scope.row[item.prop]).className"
            >
              {{ getDateStatus(scope.row[item.prop]).label }}
            </span>
          </span>
          <!-- 其他字段：默认显示 -->
          <span v-else>{{ scope.row[item.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column fixed="right" label="Operations" min-width="120">
        <template #default="scope">
          <el-button type="primary" size="small" @click="handleEdit(scope.row)">
            编辑
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页组件 -->
    <el-pagination
      background
      layout="prev, pager, next"
      :total="config.total"
      @current-change="handleChange"
      class="pager"
    />
  </div>
  <!-- 新增用户弹窗组件 -->
  <el-dialog
    v-model="dialogVisible"
    :title="action === 'add' ? '新增用户' : '编辑用户'"
    width="50%"
    :before-close="handleClose"
  >
    <el-form
      :inline="true"
      :model="formUser"
      :rules="rules"
      ref="formRef"
      label-width="150px"
      class="crew-form"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input
              v-model="formUser.name"
              placeholder="请输入姓名"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="职务" prop="position">
            <el-input
              v-model="formUser.position"
              placeholder="请输入职务"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="性别" prop="sex" class="select-clean">
            <el-select
              v-model="formUser.sex"
              placeholder="请选择"
              style="width: 194px"
            >
              <el-option label="男" value="1"></el-option>
              <el-option label="女" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="籍贯" prop="nativePlace">
            <el-input
              v-model="formUser.nativePlace"
              placeholder="请输入籍贯"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="所属船只" prop="ship">
            <el-input
              v-model="formUser.ship"
              placeholder="请输入所属船只"
            ></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号码" prop="phone">
            <el-input
              v-model="formUser.phone"
              placeholder="请输入手机号码"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="适任证书有效期至" prop="competencyExpiry">
            <el-date-picker
              v-model="formUser.competencyExpiry"
              type="date"
              placeholder="请选择日期"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="培训证书有效期至" prop="trainingExpiry">
            <el-date-picker
              v-model="formUser.trainingExpiry"
              type="date"
              placeholder="请选择日期"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="健康证书有效期至" prop="healthExpiry">
            <el-date-picker
              v-model="formUser.healthExpiry"
              type="date"
              placeholder="请选择日期"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-form-item label="等级与职务" prop="rankLevel">
            <el-input
              v-model="formUser.rankLevel"
              type="input"
              style="width: 630px"
              placeholder="请输入等级与职务"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row style="justify-content: flex-end">
        <el-form-item>
          <el-button type="primary" @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </el-form-item>
      </el-row>
      <!-- 设置一个隐藏的input框，当action为edit时，需要将id赋值给这个input框，
      用于更新用户接口的参数 -->
      <el-form-item>
        <el-input
          v-if="action === 'edit'"
          type="hidden"
          v-model="formUser.id"
        ></el-input>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<style scoped lang="less">
.user-header {
  display: flex;
  justify-content: space-between;
}
.table {
  position: relative;
}
.pager {
  position: absolute;
  bottom: -50px;
  right: 0;
}
.select-clean {
  display: flex;
}
// 等级与职务列内容自动换行，避免被截断
:deep(.multi-line-cell .cell) {
  white-space: normal;
  line-height: 1.4;
}
// 弹窗表单 - 让 form-item 占满 col 宽度，避免 inline-block 自适应过窄
:deep(.crew-form .el-form-item) {
  width: 100%;
}
// form-item content 占满 form-item（label 之外的部分）
:deep(.crew-form .el-form-item__content) {
  width: 100%;
}
// 等级与职务等 el-input 的可见输入框占满 col
:deep(.crew-form .el-input__wrapper) {
  width: 100%;
}
// 日期状态标签
.status-tag {
  display: inline-block;
  padding: 1px 8px;
  margin-left: 6px;
  border-radius: 5px;
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  vertical-align: middle;

  &.valid {
    background: #e8f5e9;
    color: #2e7d32;
    border: 1px solid #a5d6a7;
  }
  &.warning {
    background: #e3f2fd;
    color: #1565c0;
    border: 1px solid #90caf9;
  }
  &.urgent {
    background: #fff3e0;
    color: #ef6c00;
    border: 1px solid #ffcc80;
  }
  &.expired {
    background: #ffebee;
    color: #c62828;
    border: 1px solid #ef9a9a;
  }
}
</style>
