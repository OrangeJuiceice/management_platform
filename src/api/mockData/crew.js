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

function futureDate() {
  const now = new Date()
  const offsetDays = Math.floor(Math.random() * 5 * 365) + 1
  const d = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
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
      competencyExpiry: futureDate(),
      rankLevel: rankLevels[Math.floor(Math.random() * rankLevels.length)],
      phone: generatePhone(),
      trainingExpiry: futureDate(),
      healthExpiry: futureDate()
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
  }
}
