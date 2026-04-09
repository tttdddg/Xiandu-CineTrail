// pages/detail/detail.js
Page({
  data: {
    spot: {},
    isCheckedIn: false,
    isCheckingIn: false
  },

  onLoad(options) {
    const spotId = parseInt(options.id)
    this.loadSpotData(spotId)
    this.checkCheckinStatus(spotId)
  },

  loadSpotData(spotId) {
    // 模拟点位数据
    const spots = {
      1: {
        id: 1,
        name: '鼎湖峰',
        type: 'movie',
        description: '鼎湖峰是仙都景区的核心景点，海拔170.8米，状如春笋，直刺云天，被誉为天下第一峰。这里曾是《仙剑奇侠传》、《花千骨》等多部热门影视剧的取景地，自然风光秀美，文化底蕴深厚。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dinghu%20Peak%20in%20Xiandu%20Scenic%20Area%20with%20tall%20mountain%20and%20clear%20water&image_size=landscape_16_9'
      },
      2: {
        id: 2,
        name: '时思寺',
        type: 'game',
        description: '时思寺是一座历史悠久的古刹，建于北宋时期，建筑风格独特，环境清幽。这里与《梦幻西游》、《大话西游》等游戏中的场景极为相似，是游戏玩家的打卡圣地。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shisi%20Temple%20ancient%20Buddhist%20temple%20with%20traditional%20Chinese%20architecture&image_size=landscape_16_9'
      }
    }

    if (spots[spotId]) {
      this.setData({ spot: spots[spotId] })
      wx.setNavigationBarTitle({ title: spots[spotId].name })
    }
  },

  checkCheckinStatus(spotId) {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      // 这里可以调用云函数检查是否已打卡
      // 暂时使用本地存储模拟
      const checkins = wx.getStorageSync('checkins') || []
      const hasCheckedIn = checkins.some(c => c.spotId === spotId && c.userId === userInfo.openId)
      this.setData({ isCheckedIn: hasCheckedIn })
    }
  },

  checkin() {
    if (this.data.isCheckingIn || this.data.isCheckedIn) return

    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }

    this.setData({ isCheckingIn: true })

    // 调用云函数添加打卡记录
    wx.cloud.callFunction({
      name: 'addCheckin',
      data: {
        spotId: this.data.spot.id
      },
      success: (res) => {
        if (res.result.success) {
          wx.showToast({ title: '打卡成功', icon: 'success' })
          this.setData({ isCheckedIn: true })

          // 本地存储模拟
          const checkins = wx.getStorageSync('checkins') || []
          checkins.push({
            spotId: this.data.spot.id,
            userId: userInfo.openId,
            timestamp: Date.now()
          })
          wx.setStorageSync('checkins', checkins)
        } else {
          wx.showToast({ title: res.result.message || '打卡失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('打卡失败', err)
        wx.showToast({ title: '打卡失败，请重试', icon: 'none' })
      },
      complete: () => {
        this.setData({ isCheckingIn: false })
      }
    })
  }
})