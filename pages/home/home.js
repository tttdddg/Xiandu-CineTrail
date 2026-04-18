// pages/home/home.js
Page({
  data: {
    latitude: 28.656,
    longitude: 119.648,
    scale: 16,
    markers: [],
    selectedMarker: null,
    userLocation: null,
    showLocation: true,
    nearbySpots: [],
    showNearbyPanel: false,
    polyline: null,
    distance: null,
    duration: null,
    showRoutePanel: false
  },
  
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    this.loadSpots()
    this.getUserLocation()
  },
  
  onShow() {
    this.loadSpots()
  },
  
  loadSpots() {
    // 使用本地数据
    const spots = [
      {
        id: 1,
        name: '鼎湖峰',
        type: 'movie',
        description: '著名影视取景地，《仙剑奇侠传》等多部影视剧曾在此拍摄',
        latitude: 28.656,
        longitude: 119.648,
        hotScore: 9.8,
        checkinCount: 1256
      },
      {
        id: 2,
        name: '时思寺',
        type: 'game',
        description: '游戏IP关联点，与《梦幻西游》等游戏场景相似',
        latitude: 28.650,
        longitude: 119.640,
        hotScore: 8.5,
        checkinCount: 856
      },
      {
        id: 3,
        name: '倪翁洞',
        type: 'culture',
        description: '倪翁洞是仙都景区的重要文化景点',
        latitude: 28.660,
        longitude: 119.655,
        hotScore: 7.2,
        checkinCount: 542
      },
      {
        id: 4,
        name: '小赤壁',
        type: 'nature',
        description: '小赤壁以其独特的丹霞地貌著称',
        latitude: 28.645,
        longitude: 119.660,
        hotScore: 8.0,
        checkinCount: 678
      }
    ]
    
    this.processMarkers(spots)
  },
  
  processMarkers(spots) {
    const markers = spots.map((spot, index) => ({
      id: spot.id,
      latitude: spot.latitude,
      longitude: spot.longitude,
      name: spot.name,
      desc: spot.description,
      type: spot.type,
      hotScore: spot.hotScore,
      checkinCount: spot.checkinCount,
      width: 40,
      height: 40,
      callout: {
        content: spot.name,
        color: '#333',
        fontSize: 14,
        borderRadius: 4,
        bgColor: 'white',
        padding: 8,
        display: 'BYCLICK'
      }
    }))
    
    this.setData({ markers })
  },
  
  getUserLocation() {
    wx.getSetting({
      success: (res) => {
        if (res.authSetting['scope.userLocation']) {
          this.getLocation()
        } else {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              this.getLocation()
            },
            fail: () => {
              console.log('用户拒绝授权位置信息')
            }
          })
        }
      }
    })
  },
  
  getLocation() {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({ 
          userLocation: {
            latitude: res.latitude,
            longitude: res.longitude
          }
        })
      },
      fail: (err) => {
        console.error('获取位置失败', err)
      }
    })
  },
  
  onMarkerTap(e) {
    const markerId = e.detail.markerId || e.markerId
    const marker = this.data.markers.find(m => m.id === markerId)
    if (marker) {
      this.setData({ selectedMarker: marker })
    }
  },
  
  showNearbyPanel() {
    this.setData({ showNearbyPanel: true })
  },
  
  hideNearbyPanel() {
    this.setData({ showNearbyPanel: false })
  },
  
  planRoute() {
    const spot = this.data.selectedMarker
    if (!spot) return
    
    wx.showToast({ title: '路线规划功能需要云服务支持', icon: 'none' })
  },
  
  hideRoutePanel() {
    this.setData({ 
      showRoutePanel: false,
      polyline: null
    })
  },
  
  openNavigation() {
    const spot = this.data.selectedMarker
    if (!spot) return
    
    wx.openLocation({
      latitude: spot.latitude,
      longitude: spot.longitude,
      name: spot.name,
      address: spot.desc,
      scale: 18
    })
  },
  
  goToDetail() {
    if (this.data.selectedMarker) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${this.data.selectedMarker.id}&name=${this.data.selectedMarker.name}`
      })
    }
  },
  
  moveToLocation() {
    const mapContext = wx.createMapContext('map', this)
    mapContext.moveToLocation()
  }
})
