// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'YOUR_ENV_ID', // 请替换为实际的云环境ID
      traceUser: true
    })
    
    // 检查用户登录状态
    this.checkLoginStatus()
  },
  
  checkLoginStatus() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
  },
  
  globalData: {
    userInfo: null
  }
})