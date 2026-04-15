// pages/admin/statistics.js
Page({
  data: {
    stats: {
      totalUsers: 0,
      totalSpots: 0,
      totalCheckins: 0,
      todayCheckins: 0
    },
    timeRange: 'week',
    trendData: [],
    hotSpots: [],
    activity: {
      daily: 0,
      weekly: 0,
      monthly: 0
    },
    categoryStats: []
  },
  
  onLoad() {
    this.loadStatistics()
  },
  
  onShow() {
    this.loadStatistics()
  },
  
  loadStatistics() {
    this.loadOverviewStats()
    this.loadTrendData()
    this.loadHotSpots()
    this.loadActivityData()
    this.loadCategoryStats()
  },
  
  loadOverviewStats() {
    wx.cloud.callFunction({
      name: 'getStatistics',
      data: { type: 'overview' },
      success: (res) => {
        if (res.result.success) {
          this.setData({ stats: res.result.stats })
        }
      },
      fail: () => {
        this.setData({
          stats: {
            totalUsers: 1256,
            totalSpots: 24,
            totalCheckins: 8560,
            todayCheckins: 128
          }
        })
      }
    })
  },
  
  loadTrendData() {
    const days = this.data.timeRange === 'week' ? 7 : 30
    const trendData = []
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      
      trendData.push({
        label: `${date.getMonth() + 1}/${date.getDate()}`,
        value: Math.floor(Math.random() * 100) + 20,
        percent: Math.floor(Math.random() * 80) + 20
      })
    }
    
    this.setData({ trendData })
  },
  
  loadHotSpots() {
    const hotSpots = [
      { id: 1, name: '鼎湖峰', checkinCount: 1256, hotScore: 9.8, trend: 'up' },
      { id: 2, name: '时思寺', checkinCount: 856, hotScore: 8.5, trend: 'up' },
      { id: 3, name: '倪翁洞', checkinCount: 542, hotScore: 7.2, trend: 'down' },
      { id: 4, name: '小赤壁', checkinCount: 678, hotScore: 8.0, trend: 'up' },
      { id: 5, name: '仙都观', checkinCount: 423, hotScore: 6.8, trend: 'down' }
    ]
    
    this.setData({ hotSpots })
  },
  
  loadActivityData() {
    this.setData({
      activity: {
        daily: 328,
        weekly: 856,
        monthly: 1256
      }
    })
  },
  
  loadCategoryStats() {
    const categories = [
      { type: 'movie', name: '影视取景地', count: 8 },
      { type: 'game', name: '游戏IP关联点', count: 6 },
      { type: 'culture', name: '文化古迹', count: 5 },
      { type: 'nature', name: '自然风光', count: 5 }
    ]
    
    const total = categories.reduce((sum, c) => sum + c.count, 0)
    const categoryStats = categories.map(c => ({
      ...c,
      percent: Math.round((c.count / total) * 100)
    }))
    
    this.setData({ categoryStats })
  },
  
  changeTimeRange(e) {
    const range = e.currentTarget.dataset.range
    this.setData({ timeRange: range })
    this.loadTrendData()
  },
  
  onPullDownRefresh() {
    this.loadStatistics()
    wx.stopPullDownRefresh()
  }
})
