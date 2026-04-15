// pages/mine/mine.js
const { formatTime } = require('../../utils/index.js')

const LevelConfig = [
  { level: 1, name: '新手旅行者', minValue: 0, maxValue: 100 },
  { level: 2, name: '初级探险家', minValue: 100, maxValue: 300 },
  { level: 3, name: '资深游客', minValue: 300, maxValue: 600 },
  { level: 4, name: '旅行达人', minValue: 600, maxValue: 1000 },
  { level: 5, name: '打卡大师', minValue: 1000, maxValue: 2000 },
  { level: 6, name: '传奇旅行家', minValue: 2000, maxValue: 5000 },
  { level: 7, name: '仙都守护者', minValue: 5000, maxValue: 10000 }
]

Page({
  data: {
    userInfo: {},
    userLevel: 1,
    levelName: '新手旅行者',
    growthValue: 0,
    nextLevelValue: 100,
    growthPercent: 0,
    needGrowth: 100,
    totalCheckins: 0,
    continuousDays: 0,
    totalLikes: 0,
    unreadCount: 0,
    badges: [],
    lockedBadges: [],
    chartData: []
  },

  onLoad() {
    this.loadUserInfo()
    this.loadUserStats()
    this.loadBadges()
    this.loadChartData()
    this.loadUnreadCount()
  },

  onShow() {
    this.loadUserInfo()
    this.loadUserStats()
    this.loadUnreadCount()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
      this.calculateLevel(userInfo.growthValue || 0)
    }
  },

  calculateLevel(growthValue) {
    let level = 1
    let levelName = '新手旅行者'
    let nextLevelValue = 100
    let needGrowth = 100 - growthValue

    for (let i = LevelConfig.length - 1; i >= 0; i--) {
      if (growthValue >= LevelConfig[i].minValue) {
        level = LevelConfig[i].level
        levelName = LevelConfig[i].name
        if (i < LevelConfig.length - 1) {
          nextLevelValue = LevelConfig[i + 1].minValue
          needGrowth = nextLevelValue - growthValue
        } else {
          nextLevelValue = LevelConfig[i].maxValue
          needGrowth = 0
        }
        break
      }
    }

    const growthPercent = Math.min((growthValue / nextLevelValue) * 100, 100)

    this.setData({
      userLevel: level,
      levelName,
      growthValue,
      nextLevelValue,
      growthPercent,
      needGrowth
    })
  },

  loadUserStats() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) return

    const checkins = wx.getStorageSync('checkins') || []
    const userCheckins = checkins.filter(c => c.userId === userInfo.openId)

    const totalCheckins = userCheckins.length
    const continuousDays = this.calculateContinuousDays(userCheckins)
    const totalLikes = userCheckins.reduce((sum, c) => sum + (c.likeCount || 0), 0)

    this.setData({ totalCheckins, continuousDays, totalLikes })
  },

  calculateContinuousDays(checkins) {
    if (checkins.length === 0) return 0

    const sortedCheckins = checkins
      .map(c => new Date(c.timestamp).setHours(0, 0, 0, 0))
      .sort((a, b) => b - a)

    let continuousDays = 1
    const oneDay = 24 * 60 * 60 * 1000
    const today = new Date().setHours(0, 0, 0, 0)

    const lastCheckin = sortedCheckins[0]
    if (today - lastCheckin > oneDay) {
      return 0
    }

    for (let i = 0; i < sortedCheckins.length - 1; i++) {
      if (sortedCheckins[i] - sortedCheckins[i + 1] === oneDay) {
        continuousDays++
      } else {
        break
      }
    }

    return continuousDays
  },

  loadBadges() {
    const { totalCheckins, continuousDays } = this.data

    const allBadges = [
      { id: 1, name: '初次打卡', icon: '🌟', condition: totalCheckins >= 1 },
      { id: 2, name: '打卡达人', icon: '🏆', condition: totalCheckins >= 10 },
      { id: 3, name: '连续3天', icon: '🔥', condition: continuousDays >= 3 },
      { id: 4, name: '连续7天', icon: '💎', condition: continuousDays >= 7 },
      { id: 5, name: '打卡大师', icon: '👑', condition: totalCheckins >= 50 },
      { id: 6, name: '传奇旅行家', icon: '🎖️', condition: totalCheckins >= 100 }
    ]

    const badges = allBadges.filter(b => b.condition)
    const lockedBadges = allBadges.filter(b => !b.condition).slice(0, 3)

    this.setData({ badges, lockedBadges })
  },

  loadChartData() {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    const chartData = days.map((label, index) => ({
      label,
      value: Math.floor(Math.random() * 10) + 1,
      percent: Math.floor(Math.random() * 80) + 20
    }))

    this.setData({ chartData })
  },

  loadUnreadCount() {
    const messages = wx.getStorageSync('messages') || []
    const unreadCount = messages.filter(m => !m.isRead).length
    this.setData({ unreadCount })
  },

  viewAllBadges() {
    wx.navigateTo({ url: '/pages/badge/badge' })
  },

  goToCheckinList() {
    wx.navigateTo({ url: '/pages/checkin-list/checkin-list' })
  },

  goToFavorites() {
    wx.navigateTo({ url: '/pages/favorites/favorites' })
  },

  goToMessages() {
    wx.navigateTo({ url: '/pages/message/message' })
  },

  goToSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  },

  logout() {
    wx.showModal({
      title: '退出登录',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          wx.removeStorageSync('checkins')
          getApp().globalData.userInfo = null
          wx.switchTab({ url: '/pages/home/home' })
        }
      }
    })
  }
})
