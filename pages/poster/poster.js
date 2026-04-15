// pages/poster/poster.js
const { showToast, showLoading, hideLoading, getImageInfo, saveImageToPhotosAlbum } = require('../../utils/index.js')

Page({
  data: {
    spotId: null,
    spot: null,
    posterImage: '',
    canvasWidth: 375,
    canvasHeight: 667
  },
  
  onLoad(options) {
    this.setData({ spotId: options.spotId })
    this.loadSpotData()
  },
  
  loadSpotData() {
    const spots = {
      1: {
        id: 1,
        name: '鼎湖峰',
        type: 'movie',
        description: '鼎湖峰是仙都景区的核心景点',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dinghu%20Peak%20in%20Xiandu%20Scenic%20Area&image_size=square',
        checkinCount: 1256,
        hotScore: 9.8
      },
      2: {
        id: 2,
        name: '时思寺',
        type: 'game',
        description: '时思寺是一座历史悠久的古刹',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shisi%20Temple%20ancient%20Buddhist%20temple&image_size=square',
        checkinCount: 856,
        hotScore: 8.5
      }
    }
    
    const spot = spots[this.data.spotId] || spots[1]
    this.setData({ spot }, () => {
      this.generatePoster()
    })
  },
  
  generatePoster() {
    showLoading('生成海报中...')
    
    const ctx = wx.createCanvasContext('posterCanvas', this)
    const { canvasWidth, canvasHeight, spot } = this.data
    const padding = 30
    const imageWidth = canvasWidth - padding * 2
    const imageHeight = imageWidth * 0.75
    
    ctx.setFillStyle('#ffffff')
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
    
    ctx.setFillStyle('#007aff')
    ctx.fillRect(0, 0, canvasWidth, 80)
    
    ctx.setFillStyle('#ffffff')
    ctx.setFontSize(24)
    ctx.setTextAlign('center')
    ctx.fillText('仙都影游打卡', canvasWidth / 2, 50)
    
    getImageInfo(spot.coverImage).then(imgInfo => {
      ctx.drawImage(imgInfo.path, padding, 100, imageWidth, imageHeight)
      
      ctx.setStrokeStyle('#007aff')
      ctx.setLineWidth(2)
      ctx.strokeRect(padding, 100, imageWidth, imageHeight)
      
      ctx.setFillStyle('#333333')
      ctx.setFontSize(28)
      ctx.setTextAlign('left')
      ctx.fillText(spot.name, padding, 100 + imageHeight + 50)
      
      const typeText = spot.type === 'movie' ? '影视取景地' : '游戏IP关联点'
      ctx.setFillStyle('#007aff')
      ctx.setFontSize(22)
      ctx.fillText(typeText, padding, 100 + imageHeight + 85)
      
      ctx.setFillStyle('#666666')
      ctx.setFontSize(20)
      const desc = spot.description.length > 30 ? spot.description.substring(0, 30) + '...' : spot.description
      ctx.fillText(desc, padding, 100 + imageHeight + 120)
      
      ctx.setFillStyle('#ff9800')
      ctx.setFontSize(20)
      ctx.fillText(`🔥 热度: ${spot.hotScore}`, padding, 100 + imageHeight + 160)
      
      ctx.setFillStyle('#52c41a')
      ctx.fillText(`✅ ${spot.checkinCount}人打卡`, padding + 120, 100 + imageHeight + 160)
      
      ctx.setFillStyle('#999999')
      ctx.setFontSize(18)
      ctx.setTextAlign('center')
      ctx.fillText('扫码了解更多精彩内容', canvasWidth / 2, canvasHeight - 60)
      
      ctx.draw(false, () => {
        setTimeout(() => {
          wx.canvasToTempFilePath({
            canvasId: 'posterCanvas',
            success: (res) => {
              hideLoading()
              this.setData({ posterImage: res.tempFilePath })
            },
            fail: (err) => {
              hideLoading()
              showToast('生成海报失败')
              console.error(err)
            }
          }, this)
        }, 500)
      })
    }).catch(err => {
      hideLoading()
      showToast('加载图片失败')
      console.error(err)
    })
  },
  
  saveToAlbum() {
    if (!this.data.posterImage) {
      showToast('请先生成海报')
      return
    }
    
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.writePhotosAlbum']) {
          this.doSaveToAlbum()
        } else {
          wx.authorize({
            scope: 'scope.writePhotosAlbum',
            success: () => {
              this.doSaveToAlbum()
            },
            fail: () => {
              wx.showModal({
                title: '提示',
                content: '需要相册权限才能保存图片',
                success: (res) => {
                  if (res.confirm) {
                    wx.openSetting()
                  }
                }
              })
            }
          })
        }
      }
    })
  },
  
  doSaveToAlbum() {
    saveImageToPhotosAlbum(this.data.posterImage).then(() => {
      showToast('保存成功', 'success')
    }).catch(() => {
      showToast('保存失败')
    })
  },
  
  shareToFriends() {
    if (!this.data.posterImage) {
      showToast('请先生成海报')
      return
    }
    
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  
  onShareAppMessage() {
    return {
      title: `我在${this.data.spot.name}打卡啦！`,
      path: `/pages/detail/detail?id=${this.data.spotId}`,
      imageUrl: this.data.posterImage
    }
  },
  
  onShareTimeline() {
    return {
      title: `我在${this.data.spot.name}打卡啦！`,
      query: `id=${this.data.spotId}`,
      imageUrl: this.data.posterImage
    }
  }
})
