// pages/login/login.js
Page({
  data: {
    isLoading: false
  },
  
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      wx.switchTab({ url: '/pages/home/home' })
    }
  },
  
  login() {
    if (this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    // 模拟登录，使用本地数据
    setTimeout(() => {
      const userInfo = {
        openId: 'user_' + Date.now(),
        nickName: '旅行达人',
        avatarUrl: 'https://via.placeholder.com/120',
        role: 1,
        level: 1,
        growthValue: 0,
        totalChecks: 0
      }
      
      wx.setStorageSync('userInfo', userInfo)
      getApp().globalData.userInfo = userInfo
      
      this.setData({ isLoading: false })
      
      wx.showToast({ title: '登录成功', icon: 'success' })
      
      setTimeout(() => {
        wx.switchTab({ url: '/pages/home/home' })
      }, 1000)
    }, 500)
  }
})
