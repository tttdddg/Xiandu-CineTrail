// pages/login/login.js
Page({
  data: {
    isLoading: false
  },
  
  onLoad() {
    // 检查是否已登录
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      wx.switchTab({ url: '/pages/home/home' })
    }
  },
  
  login() {
    if (this.data.isLoading) return
    
    this.setData({ isLoading: true })
    
    // 调用微信登录API
    wx.login({
      success: (res) => {
        if (res.code) {
          // 调用云函数获取openId
          wx.cloud.callFunction({
            name: 'login',
            data: {
              code: res.code
            },
            success: (cloudRes) => {
              const userInfo = cloudRes.result.userInfo
              wx.setStorageSync('userInfo', userInfo)
              getApp().globalData.userInfo = userInfo
              wx.switchTab({ url: '/pages/home/home' })
            },
            fail: (err) => {
              console.error('登录失败', err)
              wx.showToast({ title: '登录失败，请重试', icon: 'none' })
            },
            complete: () => {
              this.setData({ isLoading: false })
            }
          })
        } else {
          console.error('登录失败：', res.errMsg)
          wx.showToast({ title: '登录失败，请重试', icon: 'none' })
          this.setData({ isLoading: false })
        }
      },
      fail: (err) => {
        console.error('登录失败：', err)
        wx.showToast({ title: '登录失败，请重试', icon: 'none' })
        this.setData({ isLoading: false })
      }
    })
  }
})