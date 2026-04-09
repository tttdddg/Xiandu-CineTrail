// pages/mine/mine.js
Page({
  data: {
    userInfo: {},
    totalCheckins: 0,
    checkins: []
  },

  onLoad() {
    this.loadUserInfo()
    this.loadCheckinData()
  },

  onShow() {
    this.loadUserInfo()
    this.loadCheckinData()
  },

  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  loadCheckinData() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      // 调用云函数获取打卡记录
      wx.cloud.callFunction({
        name: 'getMyCheckins',
        success: (res) => {
          if (res.result.checkins) {
            this.setData({
              checkins: res.result.checkins,
              totalCheckins: res.result.checkins.length
            })
          }
        },
        fail: (err) => {
          console.error('获取打卡记录失败', err)
          // 本地存储模拟
          this.loadLocalCheckins()
        }
      })
    } else {
      this.setData({ checkins: [], totalCheckins: 0 });
    }
  },
  
  loadLocalCheckins() {
    const checkins = wx.getStorageSync('checkins') || []
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      const userCheckins = checkins.filter(c => c.userId === userInfo.openId)
      // 转换时间格式
      const formattedCheckins = userCheckins.map(c => {
        const date = new Date(c.timestamp)
        const timeStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
        return {
          spotName: c.spotId === 1 ? '鼎湖峰' : '时思寺',
          checkinTime: timeStr
        }
      })
      this.setData({
        checkins: formattedCheckins,
        totalCheckins: formattedCheckins.length
      })
    }
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