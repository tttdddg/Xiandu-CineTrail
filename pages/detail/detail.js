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
    reviewStatus: 'pending',
    reviewStatusText: {
      pending: '审核中',
      approved: '已通过',
      rejected: '已拒绝'
    },
    canMakeup: false,
    makeupDays: 3,
    continuousDays: 0,
    totalCheckins: 0,
    showMakeupModal: false,
    makeupReason: '',
    userLocation: null,
    distanceToSpot: null,
    checkinDistance: 500,
    canCheckinByLocation: true
  },

  onLoad(options) {
    const spotId = parseInt(options.id)
    this.loadSpotData(spotId)
    this.checkCheckinStatus(spotId)
    this.getUserLocation()
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

  getUserLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        const userLocation = {
          latitude: res.latitude,
          longitude: res.longitude
        }
        this.setData({ userLocation })
        this.calculateDistanceToSpot()
      },
      fail: (err) => {
        console.error('获取位置失败', err)
        this.setData({ canCheckinByLocation: false })
      }
    })
  },

  calculateDistanceToSpot() {
    const { userLocation, spot } = this.data
    if (!userLocation || !spot.latitude) return

    const distance = this.calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      spot.latitude,
      spot.longitude
    )

    this.setData({
      distanceToSpot: distance,
      canCheckinByLocation: distance <= this.data.checkinDistance
    })
  },

  calculateDistance(lat1, lng1, lat2, lng2) {
    const rad = (d) => d * Math.PI / 180.0
    const EARTH_RADIUS = 6378.137

    const radLat1 = rad(lat1)
    const radLat2 = rad(lat2)
    const a = radLat1 - radLat2
    const b = rad(lng1) - rad(lng2)

    let s = 2 * Math.asin(Math.sqrt(
      Math.pow(Math.sin(a / 2), 2) +
      Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
    ))
    s = s * EARTH_RADIUS
    return Math.round(s * 1000)
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

      this.checkMakeupEligibility(spotId, userInfo.openId)
    }
  },

  checkMakeupEligibility(spotId, userId) {
    const checkins = wx.getStorageSync('checkins') || []
    const hasCheckedIn = checkins.some(c => c.spotId === spotId && c.userId === userId)

    if (!hasCheckedIn) {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const makeupDeadline = new Date(today.getTime() - this.data.makeupDays * 24 * 60 * 60 * 1000)

      this.setData({ canMakeup: true })
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

    if (!this.data.canCheckinByLocation) {
      wx.showModal({
        title: '提示',
        content: `您距离该点位${this.data.distanceToSpot}米，需要距离${this.data.checkinDistance}米内才能打卡。是否申请补签？`,
        success: (res) => {
          if (res.confirm) {
            this.showMakeupModal()
          }
        }
      })
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

    this.uploadPhotos().then(photoUrls => {
      const checkinData = {
        spotId: this.data.spot.id,
        photos: photoUrls,
        reviewStatus: 'pending',
        timestamp: Date.now(),
        location: this.data.userLocation
      }

      wx.cloud.callFunction({
        name: 'addCheckin',
        data: checkinData,
        success: (res) => {
          if (res.result.success) {
            wx.showToast({ title: '打卡成功', icon: 'success' })

            const checkins = wx.getStorageSync('checkins') || []
            checkins.push({
              ...checkinData,
              userId: userInfo.openId
            })
            wx.setStorageSync('checkins', checkins)

            this.setData({
              isCheckedIn: true,
              checkinRecord: checkinData,
              reviewStatus: 'pending'
            })

            this.loadCheckinStats()
          } else {
            wx.showToast({ title: res.result.message || '打卡失败', icon: 'none' })
          }
        },
        fail: (err) => {
          console.error('打卡失败', err)
          this.saveCheckinLocally(checkinData, userInfo.openId)
        },
        complete: () => {
          this.setData({ isCheckingIn: false })
        }
      })
    }).catch(err => {
      console.error('上传照片失败', err)
      wx.showToast({ title: '上传照片失败', icon: 'none' })
      this.setData({ isCheckingIn: false })
    })
  },

  uploadPhotos() {
    return new Promise((resolve, reject) => {
      const uploadPromises = this.data.checkinPhotos.map((photo, index) => {
        return new Promise((res, rej) => {
          const cloudPath = `checkin-photos/${Date.now()}-${index}.jpg`
          wx.cloud.uploadFile({
            cloudPath: cloudPath,
            filePath: photo,
            success: (uploadRes) => {
              res(uploadRes.fileID)
            },
            fail: (err) => {
              res(photo)
            }
          })
        })
      })

      Promise.all(uploadPromises).then(urls => {
        resolve(urls)
      }).catch(err => {
        reject(err)
      })
    })
  },

  saveCheckinLocally(checkinData, userId) {
    const checkins = wx.getStorageSync('checkins') || []
    checkins.push({
      ...checkinData,
      userId: userId
    })
    wx.setStorageSync('checkins', checkins)

    this.setData({
      isCheckedIn: true,
      checkinRecord: checkinData,
      reviewStatus: 'pending'
    })

    wx.showToast({ title: '打卡成功（本地）', icon: 'success' })
    this.loadCheckinStats()
  },

  showMakeupModal() {
    this.setData({ showMakeupModal: true })
  },

  hideMakeupModal() {
    this.setData({ showMakeupModal: false, makeupReason: '' })
  },

  onMakeupReasonInput(e) {
    this.setData({ makeupReason: e.detail.value })
  },

  submitMakeup() {
    if (!this.data.makeupReason.trim()) {
      wx.showToast({ title: '请填写补签原因', icon: 'none' })
      return
    }

    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }

    if (this.data.checkinPhotos.length === 0) {
      wx.showToast({ title: '请上传打卡照片', icon: 'none' })
      return
    }

    this.setData({ isCheckingIn: true })

    this.uploadPhotos().then(photoUrls => {
      const makeupData = {
        spotId: this.data.spot.id,
        photos: photoUrls,
        reviewStatus: 'pending',
        isMakeup: true,
        makeupReason: this.data.makeupReason,
        timestamp: Date.now()
      }

      wx.cloud.callFunction({
        name: 'addCheckin',
        data: makeupData,
        success: (res) => {
          if (res.result.success) {
            wx.showToast({ title: '补签申请已提交', icon: 'success' })

            const checkins = wx.getStorageSync('checkins') || []
            checkins.push({
              ...makeupData,
              userId: userInfo.openId
            })
            wx.setStorageSync('checkins', checkins)

            this.setData({
              isCheckedIn: true,
              checkinRecord: makeupData,
              reviewStatus: 'pending'
            })

            this.hideMakeupModal()
            this.loadCheckinStats()
          } else {
            wx.showToast({ title: res.result.message || '补签失败', icon: 'none' })
          }
        },
        fail: (err) => {
          console.error('补签失败', err)
          this.saveCheckinLocally(makeupData, userInfo.openId)
          this.hideMakeupModal()
        },
        complete: () => {
          this.setData({ isCheckingIn: false })
        }
      })
    }).catch(err => {
      console.error('上传照片失败', err)
      wx.showToast({ title: '上传照片失败', icon: 'none' })
      this.setData({ isCheckingIn: false })
    })
  }
})
