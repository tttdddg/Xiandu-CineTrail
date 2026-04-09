// pages/home/home.js
Page({
  data: {
    markers: [
      {
        id: 1,
        latitude: 28.656,
        longitude: 119.648,
        name: '鼎湖峰',
        desc: '著名影视取景地，《仙剑奇侠传》等多部影视剧曾在此拍摄',

        width: 40,
        height: 40,
        callout: {
          content: '鼎湖峰',
          color: '#333',
          fontSize: 14,
          borderRadius: 4,
          bgColor: 'white',
          padding: 8,
          display: 'BYCLICK'
        }
      },
      {
        id: 2,
        latitude: 28.650,
        longitude: 119.640,
        name: '时思寺',
        desc: '游戏IP关联点，与《梦幻西游》等游戏场景相似',
        width: 40,
        height: 40,
        callout: {
          content: '时思寺',
          color: '#333',
          fontSize: 14,
          borderRadius: 4,
          bgColor: 'white',
          padding: 8,
          display: 'BYCLICK'
        }
      }
    ],
    selectedMarker: null
  },
  
  onLoad() {
    // 检查登录状态
    const userInfo = wx.getStorageSync('userInfo')
    if (!userInfo) {
      wx.navigateTo({ url: '/pages/login/login' })
    }
  },
  
  onMarkerTap(e) {
    const markerId = e.markerId
    const marker = this.data.markers.find(m => m.id === markerId)
    if (marker) {
      this.setData({ selectedMarker: marker })
    }
  },
  
  goToDetail() {
    if (this.data.selectedMarker) {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${this.data.selectedMarker.id}&name=${this.data.selectedMarker.name}`
      })
    }
  }
})