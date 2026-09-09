//这个是折线图和柱状图 两个图表共用的公共配置
export const xOptions = {
  // 图例文字颜色
  textStyle: {
    color: '#333'
  },
  legend: {},
  grid: {
    left: '20%'
  },
  // 提示框
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category', // 类目轴
    data: [],
    axisLine: {
      lineStyle: {
        color: '#17b3a3'
      }
    },
    axisLabel: {
      interval: 0,
      color: '#333'
    }
  },
  yAxis: [
    {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: '#17b3a3'
        }
      }
    }
  ],
  color: ['#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80', '#8d98b3'],
  series: []
}
// 饼图公共配置
export const pieOptions = {
  tooltip: {
    trigger: 'item'
  },
  legend: {},
  color: [
    '#0f78f4',
    '#dd536b',
    '#9462e5',
    '#a6a6a6',
    '#e1bb22',
    '#39c362',
    '#3ed1cf'
  ],
  series: []
}
