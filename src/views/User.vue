<script setup>
import { ref, getCurrentInstance, onMounted, reactive, nextTick } from 'vue'

const tableData = ref([])
const { proxy } = getCurrentInstance()

// 请求用户列表数据
const getUserData = async () => {
  const res = await proxy.$api.getUserData(config)
  // console.log(res)
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
    label: '姓名'
  },
  {
    prop: 'addr',
    label: '地址',
    width: '400'
  },
  {
    prop: 'age',
    label: '年龄'
  },
  {
    prop: 'birth',
    label: '出生日期',
    width: '200'
  },
  {
    prop: 'sexLable',
    label: '性别'
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
  addr: '',
  age: '',
  birth: '',
  sex: ''
})

// 新增用户/编辑用户表单校验规则
const rules = reactive({
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  addr: [{ required: true, message: '请输入地址', trigger: 'blur' }],
  age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
  birth: [{ required: true, message: '请输入出生日期', trigger: 'blur' }],
  sex: [{ required: true, message: '请选择性别', trigger: 'change' }]
})

// 新增用户弹窗打开事件
const handleAdd = () => {
  action.value = 'add'
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
// 新增用户/编辑用户提交事件
const onSubmit = async () => {
  // 校验表单
  await proxy.$refs.formRef.validate(async (valid) => {
    // 如果校验通过，就提交表单
    if (valid) {
      // 用res接收新增用户或编辑用户接口的返回值
      let res = null
      // 无论是新增用户还是编辑用户，都需要格式化日期
      // 如果日期格式是yyyy-MM-dd，就直接赋值，否则就化为yyyy-MM-dd格式
      formUser.birth = /^\d{4}-\d{2}-\d{2}$/.test(formUser.birth)
        ? formUser.birth
        : timeFormat(formUser.birth)

      if (action.value === 'add') {
        res = await proxy.$api.addUser(formUser)
      } else if (action.value === 'edit') {
        return
      }
      // 如果新增用户或编辑用户成功，就关闭弹窗，重置表单，刷新用户列表
      if (res) {
        dialogVisible.value = false
        proxy.$refs.formRef.resetFields()
        ElMessage({
          showClose: true,
          message: '添加成功',
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
      />
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
    width="35%"
    :before-close="handleClose"
  >
    <el-form :inline="true" :model="formUser" :rules="rules" ref="formRef">
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
          <el-form-item label="年龄" prop="age">
            <el-input
              v-model="formUser.age"
              placeholder="请输入年龄"
            ></el-input>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <!--需要注意的是设置了:inline="true"，
		      会对el-select的样式造成影响，我们通过给他设置一个class=select-clean
          在css进行处理-->
          <el-form-item label="性别" prop="sex" class="select-clean">
            <el-select v-model="formUser.sex" placeholder="请选择">
              <el-option label="男" value="1"></el-option>
              <el-option label="女" value="0"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="出生日期" prop="birth">
            <el-date-picker
              v-model="formUser.birth"
              type="date"
              placeholder="请输入"
              style="width: 100%"
            ></el-date-picker>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-form-item label="地址" prop="addr">
          <el-input v-model="formUser.addr" placeholder="请输入地址"></el-input
        ></el-form-item>
      </el-row>
      <el-row style="justify-content: flex-end">
        <el-form-item>
          <el-button type="primary" @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="onSubmit">确定</el-button>
        </el-form-item>
      </el-row>
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
</style>
