import Mock from 'mockjs'

function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
      decodeURIComponent(search)
        .replace(/"/g, '\\"')
        .replace(/&/g, '","')
        .replace(/=/g, '":"') +
      '"}'
  )
}

const positions = [
  '船长',
  '大副',
  '二副',
  '三副',
  '轮机长',
  '大管轮',
  '二管轮',
  '三管轮',
  '水手长',
  '水手',
  '机工',
  '铜匠',
  '大厨',
  '服务员'
]

const rankLevels = [
  '3000总吨及以上船舶的船长、GMDSS通用操作员',
  '500至3000总吨船舶的船长、GMDSS通用操作员',
  '3000总吨及以上船舶的大副、GMDSS通用操作员',
  '500总吨及以上船舶的二副、GMDSS通用操作员',
  '500总吨及以上船舶的值班水手',
  '主推进动力装置3000千瓦及以上船舶的轮机长',
  '主推进动力装置3000千瓦及以上船舶的大管轮',
  '主推进动力装置750千瓦及以上船舶的二管轮',
  '主推进动力装置750千瓦及以上船舶的值班机工'
]

// 预设船名列表（模拟一个中型船公司的船队）
const shipNames = [
  '华祥海号',
  '远洋之星',
  '海洋1号',
  '华海168',
  '新华阳号',
  '振华8号',
  '远航者',
  '华洋200',
  '中海9号',
  '东方之星',
  '远洋168',
  '蓝海号'
]

// 生成随机证书到期日期，覆盖 4 种状态：
// 20% 过期（过去 2 年内）/ 10% 临期（0-30 天）/ 20% 待续期（30-90 天）/ 50% 有效（90 天-5 年）
function randomExpiryDate() {
  const now = new Date()
  const rand = Math.random()
  let offsetDays
  if (rand < 0.2) {
    // 过期：过去 2 年内
    offsetDays = -(Math.floor(Math.random() * 2 * 365) + 1)
  } else if (rand < 0.3) {
    // 临期：未来 0-30 天
    offsetDays = Math.floor(Math.random() * 30)
  } else if (rand < 0.5) {
    // 待续期：未来 30-90 天
    offsetDays = 30 + Math.floor(Math.random() * 61)
  } else {
    // 有效：未来 90 天-5 年
    offsetDays = 90 + Math.floor(Math.random() * (5 * 365 - 90))
  }
  const d = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// 判断单个证书日期的状态
// 返回 'expired'（过期）/'urgent'（临期）/ null（待续期/有效，不显示）
function checkExpiry(dateStr, today) {
  if (!dateStr) return null
  const [y, m, d] = dateStr.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const diffDays = Math.floor((target - today) / (24 * 60 * 60 * 1000))
  if (diffDays < 0) return 'expired'
  if (diffDays < 30) return 'urgent'
  return null
}

function generatePhone() {
  const second = Math.floor(Math.random() * 8) + 2
  let tail = ''
  for (let i = 0; i < 9; i++) {
    tail += Math.floor(Math.random() * 10)
  }
  return `1${second}${tail}`
}

let List = []
const count = 200
for (let i = 0; i < count; i++) {
  List.push(
    Mock.mock({
      id: Mock.Random.guid(),
      name: Mock.Random.cname(),
      position: positions[Math.floor(Math.random() * positions.length)],
      sex: Mock.Random.integer(0, 1),
      nativePlace: Mock.mock('@city(true)'),
      ship: shipNames[Math.floor(Math.random() * shipNames.length)],
      competencyExpiry: randomExpiryDate(),
      rankLevel: rankLevels[Math.floor(Math.random() * rankLevels.length)],
      phone: generatePhone(),
      trainingExpiry: randomExpiryDate(),
      healthExpiry: randomExpiryDate()
    })
  )
}

export default {
  getUserList: (config) => {
    const { name, page = 1, limit = 10 } = param2Obj(config.url)

    const mockList = List.filter((crew) => {
      if (name && crew.name.indexOf(name) === -1) return false
      return true
    })
    const pageList = mockList.filter(
      (item, index) => index < limit * page && index >= limit * (page - 1)
    )
    return {
      code: 200,
      data: {
        list: pageList,
        count: mockList.length
      }
    }
  },

  deleteUser: (config) => {
    const { id } = param2Obj(config.url)

    if (!id) {
      return {
        code: -999,
        message: '参数不正确'
      }
    } else {
      List = List.filter((u) => u.id !== id)
      return {
        code: 200,
        message: '删除成功'
      }
    }
  },

  createUser: (config) => {
    const {
      name,
      position,
      sex,
      nativePlace,
      ship,
      competencyExpiry,
      rankLevel,
      phone,
      trainingExpiry,
      healthExpiry
    } = JSON.parse(config.body)
    List.unshift({
      id: Mock.Random.guid(),
      name: name,
      position: position,
      sex: sex,
      nativePlace: nativePlace,
      ship: ship,
      competencyExpiry: competencyExpiry,
      rankLevel: rankLevel,
      phone: phone,
      trainingExpiry: trainingExpiry,
      healthExpiry: healthExpiry
    })
    return {
      code: 200,
      data: {
        message: '添加成功'
      }
    }
  },

  updateUser: (config) => {
    const {
      id,
      name,
      position,
      sex,
      nativePlace,
      ship,
      competencyExpiry,
      rankLevel,
      phone,
      trainingExpiry,
      healthExpiry
    } = JSON.parse(config.body)
    const sex_num = parseInt(sex)
    List.some((u) => {
      if (u.id === id) {
        u.name = name
        u.position = position
        u.sex = sex_num
        u.nativePlace = nativePlace
        u.ship = ship
        u.competencyExpiry = competencyExpiry
        u.rankLevel = rankLevel
        u.phone = phone
        u.trainingExpiry = trainingExpiry
        u.healthExpiry = healthExpiry
        return true
      }
    })
    return {
      code: 200,
      data: {
        message: '编辑成功'
      }
    }
  },

  // 获取仪表盘数据：3 个证书各自的过期/临期船员列表
  getStatusList: () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const competencyExpired = [] // 适任证书过期/临期
    const trainingExpired = [] // 培训证书过期/临期
    const healthExpired = [] // 健康证书过期/临期

    List.forEach((crew) => {
      // 检查适任证书
      const competencyStatus = checkExpiry(crew.competencyExpiry, today)
      if (competencyStatus) {
        competencyExpired.push({
          id: crew.id,
          name: crew.name,
          position: crew.position,
          ship: crew.ship,
          expiryDate: crew.competencyExpiry,
          status: competencyStatus
        })
      }
      // 检查培训证书
      const trainingStatus = checkExpiry(crew.trainingExpiry, today)
      if (trainingStatus) {
        trainingExpired.push({
          id: crew.id,
          name: crew.name,
          position: crew.position,
          ship: crew.ship,
          expiryDate: crew.trainingExpiry,
          status: trainingStatus
        })
      }
      // 检查健康证书
      const healthStatus = checkExpiry(crew.healthExpiry, today)
      if (healthStatus) {
        healthExpired.push({
          id: crew.id,
          name: crew.name,
          position: crew.position,
          ship: crew.ship,
          expiryDate: crew.healthExpiry,
          status: healthStatus
        })
      }
    })

    return {
      code: 200,
      data: {
        competencyExpired,
        trainingExpired,
        healthExpired
      }
    }
  }
}
