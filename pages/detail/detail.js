// pages/detail/detail.js
Page({
  data: {
    spot: {},
    isCheckedIn: false,
    isCheckingIn: false,
    checkinPhotos: [],
    showPhotoModal: false,
    currentPhoto: '',
    checkinRecord: null,
    reviewStatus: 'approved',
    canMakeup: false,
    continuousDays: 0,
    totalCheckins: 0,
    userLocation: null,
    distanceToSpot: null,
    checkinDistance: 500,
    canCheckinByLocation: true
  },
  
  onLoad(options) {
    const spotId = parseInt(options.id)
    this.loadSpotData(spotId)
    this.checkCheckinStatus(spotId)
    this.loadCheckinStats()
  },
  
  loadSpotData(spotId) {
    const spots = {
      1: {
        id: 1,
        name: '鼎湖峰',
        type: 'movie',
        description: '鼎湖峰是仙都景区的核心景点，海拔170.8米，状如春笋，直刺云天，被誉为天下第一峰。这里曾是《仙剑奇侠传》、《花千骨》等多部热门影视剧的取景地，自然风光秀美，文化底蕴深厚。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dinghu%20Peak%20in%20Xiandu%20Scenic%20Area%20with%20tall%20mountain%20and%20clear%20water&image_size=landscape_16_9',
        latitude: 28.656,
        longitude: 119.648
      },
      2: {
        id: 2,
        name: '时思寺',
        type: 'game',
        description: '时思寺是一座历史悠久的古刹，建于北宋时期，建筑风格独特，环境清幽。这里与《梦幻西游》、《大话西游》等游戏中的场景极为相似，是游戏玩家的打卡圣地。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shisi%20Temple%20ancient%20Buddhist%20temple%20with%20traditional%20Chinese%20architecture&image_size=landscape_16_9',
        latitude: 28.650,
        longitude: 119.640
      },
      3: {
        id: 3,
        name: '倪翁洞',
        type: 'culture',
        description: '倪翁洞是仙都景区的重要文化景点，洞内保存有大量古代石刻和碑文。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ancient%20cave%20with%20stone%20inscriptions&image_size=landscape_16_9',
        latitude: 28.660,
        longitude: 119.655
      },
      4: {
        id: 4,
        name: '小赤壁',
        type: 'nature',
        description: '小赤壁以其独特的丹霞地貌著称，红色岩壁在阳光下熠熠生辉。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Red%20cliff%20Danxia%20landform&image_size=landscape_16_9',
        latitude: 28.645,
        longitude: 119.660
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
      const checkins = wx.getStorageSync('checkins') || []
      const checkinRecord = checkins.find(c => c.spotId === spotId && c.userId === userInfo.openId)
      
      if (checkinRecord) {
        this.setData({ 
          isCheckedIn: true,
          checkinRecord: checkinRecord,
          checkinPhotos: checkinRecord.photos || [],
          reviewStatus: checkinRecord.reviewStatus || 'approved'
        })
      }
    }
  },
  
  loadCheckinStats() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) return
    
    const checkins = wx.getStorageSync('checkins') || []
    const userCheckins = checkins.filter(c => c.userId === userInfo.openId)
    
    const totalCheckins = userCheckins.length
    const continuousDays = this.calculateContinuousDays(userCheckins)
    
    this.setData({ totalCheckins, continuousDays })
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
  
  choosePhoto() {
    wx.chooseMedia({
      count: 3 - this.data.checkinPhotos.length,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFiles = res.tempFiles.map(file => file.tempFilePath)
        this.setData({
          checkinPhotos: [...this.data.checkinPhotos, ...tempFiles]
        })
      }
    })
  },
  
  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath
        this.setData({
          checkinPhotos: [...this.data.checkinPhotos, tempFilePath]
        })
      }
    })
  },
  
  previewPhoto(e) {
    const url = e.currentTarget.dataset.url
    this.setData({
      showPhotoModal: true,
      currentPhoto: url
    })
  },
  
  hidePhotoModal() {
    this.setData({ showPhotoModal: false })
  },
  
  deletePhoto(e) {
    const index = e.currentTarget.dataset.index
    const checkinPhotos = this.data.checkinPhotos.filter((_, i) => i !== index)
    this.setData({ checkinPhotos })
  },
  
  checkin() {
    if (this.data.isCheckingIn || this.data.isCheckedIn) return
    
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    
    if (this.data.checkinPhotos.length === 0) {
      wx.showModal({
        title: '提示',
        content: '请先拍照上传打卡凭证',
        showCancel: false
      })
      return
    }
    
    this.setData({ isCheckingIn: true })
    
    // 模拟打卡成功
    setTimeout(() => {
      const checkinData = {
        spotId: this.data.spot.id,
        photos: this.data.checkinPhotos,
        reviewStatus: 'approved',
        timestamp: Date.now()
      }
      
      const checkins = wx.getStorageSync('checkins') || []
      checkins.push({
        ...checkinData,
        userId: userInfo.openId
      })
      wx.setStorageSync('checkins', checkins)
      
      this.setData({ 
        isCheckedIn: true,
        checkinRecord: checkinData,
        reviewStatus: 'approved',
        isCheckingIn: false
      })
      
      wx.showToast({ title: '打卡成功', icon: 'success' })
      this.loadCheckinStats()
    }, 500)
  }
})
