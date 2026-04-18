// pages/spot-list/spot-list.js
Page({
  data: {
    spots: [],
    filteredSpots: [],
    searchKeyword: '',
    currentCategory: 'all',
    sortType: 'hot',
    userLocation: null
  },
  
  onLoad() {
    this.loadSpots()
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
        typeName: '影视取景地',
        description: '鼎湖峰是仙都景区的核心景点，海拔170.8米，状如春笋，直刺云天，被誉为天下第一峰。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dinghu%20Peak%20in%20Xiandu%20Scenic%20Area&image_size=square',
        tags: ['仙剑奇侠传', '花千骨', '热门'],
        hotScore: 9.8,
        checkinCount: 1256,
        latitude: 28.656,
        longitude: 119.648,
        distance: '1.2km'
      },
      {
        id: 2,
        name: '时思寺',
        type: 'game',
        typeName: '游戏IP关联点',
        description: '时思寺是一座历史悠久的古刹，建于北宋时期，建筑风格独特，环境清幽。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shisi%20Temple%20ancient%20Buddhist%20temple&image_size=square',
        tags: ['梦幻西游', '大话西游', '古建筑'],
        hotScore: 8.5,
        checkinCount: 856,
        latitude: 28.650,
        longitude: 119.640,
        distance: '2.3km'
      },
      {
        id: 3,
        name: '倪翁洞',
        type: 'culture',
        typeName: '文化古迹',
        description: '倪翁洞是仙都景区的重要文化景点，洞内保存有大量古代石刻和碑文。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Ancient%20cave%20with%20stone%20inscriptions&image_size=square',
        tags: ['石刻', '历史', '文化'],
        hotScore: 7.2,
        checkinCount: 542,
        latitude: 28.660,
        longitude: 119.655,
        distance: '0.8km'
      },
      {
        id: 4,
        name: '小赤壁',
        type: 'nature',
        typeName: '自然风光',
        description: '小赤壁以其独特的丹霞地貌著称，红色岩壁在阳光下熠熠生辉。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Red%20cliff%20Danxia%20landform&image_size=square',
        tags: ['丹霞地貌', '自然景观', '摄影'],
        hotScore: 8.0,
        checkinCount: 678,
        latitude: 28.645,
        longitude: 119.660,
        distance: '1.5km'
      }
    ]
    
    this.setData({ spots, filteredSpots: spots })
  },
  
  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value })
    this.filterSpots()
  },
  
  onCategoryChange(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ currentCategory: category })
    this.filterSpots()
  },
  
  onSortChange(e) {
    const sortType = e.currentTarget.dataset.sort
    this.setData({ sortType })
    this.filterSpots()
  },
  
  filterSpots() {
    let { spots, searchKeyword, currentCategory, sortType } = this.data
    
    let filtered = spots.filter(spot => {
      const matchKeyword = !searchKeyword || spot.name.includes(searchKeyword)
      const matchCategory = currentCategory === 'all' || spot.type === currentCategory
      return matchKeyword && matchCategory
    })
    
    filtered.sort((a, b) => {
      if (sortType === 'hot') {
        return b.hotScore - a.hotScore
      } else if (sortType === 'checkin') {
        return b.checkinCount - a.checkinCount
      } else if (sortType === 'distance') {
        if (!a.distance || !b.distance) return 0
        const distA = parseFloat(a.distance)
        const distB = parseFloat(b.distance)
        return distA - distB
      }
      return 0
    })
    
    this.setData({ filteredSpots: filtered })
  },
  
  goToDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    })
  }
})
