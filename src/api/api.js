/* 
整个项目api的统一管理 
*/
import request from './request.js'

export default {
  // 请求首页左侧表格的数据
  getTableData() {
    return request({
      url: '/home/getTableData',
      method: 'GET'
    })
  },
  // 请求首页右侧count的数据
  getCountData() {
    return request({
      url: '/home/getCountData',
      method: 'GET'
    })
  },
  // 请求图表数据
  getChartData() {
    return request({
      url: '/home/getChartData',
      method: 'GET'
    })
  },
  // 请求用户列表数据
  getUserData(data) {
    return request({
      url: '/user/getUserData',
      method: 'GET',
      data
    })
  },
  // 删除用户
  deleteUser(data) {
    return request({
      url: '/user/deleteUser',
      method: 'GET',
      data
    })
  },
  // 新增用户
  addUser(data) {
    return request({
      url: '/user/addUser',
      method: 'POST',
      data
    })
  },
  // 修改用户
  updateUser(data) {
    return request({
      url: '/user/updateUser',
      method: 'POST',
      data
    })
  },
  // 根据不同登录账户获取不同的菜单
  getMenu(data) {
    return request({
      url: '/permission/getMenu',
      method: 'POST',
      data
    })
  }
}
