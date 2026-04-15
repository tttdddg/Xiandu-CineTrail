// pages/home/home.js
Page({
  data: {
    latitude: 28.656,
    longitude: 119.648,
    scale: 16,
    markers: [],
    originalMarkers: [],
    selectedMarker: null,
    userLocation: null,
    showLocation: true,
    nearbySpots: [],
    showNearbyPanel: false,
    polyline: null,
    distance: null,
    duration: null,
    showRoutePanel: false,
    clusterMarkers: [],
    enableCluster: true
  },
  
  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.navigateTo({ url: '/pages/login/login' })
    }
    this.loadSpots()
    this.getUserLocation()
  },
  
  onShow() {
    this.loadSpots()
  },
  
  loadSpots() {
    wx.cloud.callFunction({
      name: 'getSpots',
      success: (res) => {
        if (res.result.success) {
          const spots = res.result.spots
          this.processMarkers(spots)
        }
      },
      fail: (err) => {
        console.error('获取点位列表失败', err)
        this.loadLocalSpots()
      }
    })
  },
  
  loadLocalSpots() {
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
      },
      {
        id: 5,
        name: '仙都观',
        type: 'culture',
        description: '仙都观是一座历史悠久的道教宫观',
        latitude: 28.652,
        longitude: 119.645,
        hotScore: 6.8,
        checkinCount: 423
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
    
    this.setData({ 
      originalMarkers: markers,
      markers: markers
    })
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
              wx.showModal({
                title: '定位权限',
                content: '需要获取您的位置信息以提供附近推荐和路线规划功能',
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
        this.findNearbySpots()
      },
      fail: (err) => {
        console.error('获取位置失败', err)
      }
    })
  },
  
  findNearbySpots() {
    const { userLocation, originalMarkers } = this.data
    if (!userLocation || !originalMarkers.length) return
    
    const nearbySpots = originalMarkers.map(marker => {
      const distance = this.calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        marker.latitude,
        marker.longitude
      )
      return {
        ...marker,
        distance: distance,
        distanceText: this.formatDistance(distance)
      }
    }).sort((a, b) => a.distance - b.distance).slice(0, 5)
    
    this.setData({ nearbySpots })
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
  
  formatDistance(meters) {
    if (meters < 1000) {
      return meters + 'm'
    } else {
      return (meters / 1000).toFixed(1) + 'km'
    }
  },
  
  onMarkerTap(e) {
    const markerId = e.detail.markerId || e.markerId
    const marker = this.data.markers.find(m => m.id === markerId)
    if (marker) {
      this.setData({ selectedMarker: marker })
    }
  },
  
  onRegionChange(e) {
    if (e.type === 'end' && e.causedBy === 'scale') {
      this.updateClusterMarkers()
    }
  },
  
  updateClusterMarkers() {
    const { scale, originalMarkers, enableCluster } = this.data
    
    if (!enableCluster || scale >= 15) {
      this.setData({ markers: originalMarkers })
      return
    }
    
    const clusters = this.clusterMarkers(originalMarkers, scale)
    this.setData({ markers: clusters })
  },
  
  clusterMarkers(markers, scale) {
    const clusterDistance = 100 - scale * 5
    const clusters = []
    const visited = new Set()
    
    markers.forEach((marker, i) => {
      if (visited.has(i)) return
      
      const cluster = {
        id: marker.id,
        latitude: marker.latitude,
        longitude: marker.longitude,
        name: marker.name,
        desc: marker.desc,
        type: marker.type,
        hotScore: marker.hotScore,
        checkinCount: marker.checkinCount,
        width: 40,
        height: 40,
        count: 1,
        callout: marker.callout
      }
      
      markers.forEach((other, j) => {
        if (i !== j && !visited.has(j)) {
          const dist = this.calculateDistance(
            marker.latitude, marker.longitude,
            other.latitude, other.longitude
          )
          if (dist < clusterDistance) {
            visited.add(j)
            cluster.count++
            cluster.latitude = (cluster.latitude + other.latitude) / 2
            cluster.longitude = (cluster.longitude + other.longitude) / 2
          }
        }
      })
      
      if (cluster.count > 1) {
        cluster.name = `${cluster.count}个点位`
        cluster.callout = {
          content: `${cluster.count}个点位`,
          color: '#fff',
          fontSize: 14,
          borderRadius: 20,
          bgColor: '#007aff',
          padding: 8,
          display: 'ALWAYS'
        }
        cluster.width = 50
        cluster.height = 50
      }
      
      clusters.push(cluster)
      visited.add(i)
    })
    
    return clusters
  },
  
  showNearbyPanel() {
    this.setData({ showNearbyPanel: true })
  },
  
  hideNearbyPanel() {
    this.setData({ showNearbyPanel: false })
  },
  
  goToSpot(e) {
    const spot = e.currentTarget.dataset.spot
    this.setData({
      latitude: spot.latitude,
      longitude: spot.longitude,
      scale: 17,
      selectedMarker: spot,
      showNearbyPanel: false
    })
  },
  
  planRoute(e) {
    const spot = e.currentTarget.dataset.spot || this.data.selectedMarker
    if (!spot) return
    
    const { userLocation } = this.data
    if (!userLocation) {
      wx.showToast({ title: '请先获取位置信息', icon: 'none' })
      return
    }
    
    wx.showLoading({ title: '规划路线中...' })
    
    wx.request({
      url: 'https://apis.map.qq.com/ws/direction/v1/walking/',
      data: {
        from: `${userLocation.latitude},${userLocation.longitude}`,
        to: `${spot.latitude},${spot.longitude}`,
        key: 'YOUR_TENCENT_MAP_KEY'
      },
      success: (res) => {
        wx.hideLoading()
        if (res.data.status === 0) {
          const result = res.data.result
          const routes = result.routes[0]
          const polyline = routes.polyline
          
          const points = polyline.map(p => ({
            latitude: p.lat || p.latitude,
            longitude: p.lng || p.longitude
          }))
          
          this.setData({
            polyline: [{
              points: points,
              color: '#007aff',
              width: 4,
              arrowLine: true
            }],
            distance: routes.distance,
            duration: routes.duration,
            showRoutePanel: true
          })
        } else {
          this.simulateRoute(spot)
        }
      },
      fail: () => {
        wx.hideLoading()
        this.simulateRoute(spot)
      }
    })
  },
  
  simulateRoute(spot) {
    const { userLocation } = this.data
    const distance = this.calculateDistance(
      userLocation.latitude, userLocation.longitude,
      spot.latitude, spot.longitude
    )
    
    const steps = 20
    const points = []
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps
      points.push({
        latitude: userLocation.latitude + (spot.latitude - userLocation.latitude) * ratio,
        longitude: userLocation.longitude + (spot.longitude - userLocation.longitude) * ratio
      })
    }
    
    this.setData({
      polyline: [{
        points: points,
        color: '#007aff',
        width: 4,
        arrowLine: true
      }],
      distance: distance,
      duration: Math.round(distance / 80),
      showRoutePanel: true
    })
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
