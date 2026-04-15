// pages/admin/spot-manage.js
Page({
  data: {
    spots: [],
    totalSpots: 0,
    movieCount: 0,
    gameCount: 0,
    totalCheckins: 0,
    showModal: false,
    isEdit: false,
    editId: null,
    formData: {
      name: '',
      type: 'movie',
      coverImage: '',
      latitude: '',
      longitude: '',
      description: '',
      tagsStr: '',
      hotScore: '5.0'
    },
    typeOptions: [
      { value: 'movie', label: '影视取景地' },
      { value: 'game', label: '游戏IP关联点' },
      { value: 'culture', label: '文化古迹' },
      { value: 'nature', label: '自然风光' }
    ],
    typeIndex: 0
  },
  
  onLoad() {
    this.loadSpots()
  },
  
  onShow() {
    this.loadSpots()
  },
  
  loadSpots() {
    wx.cloud.callFunction({
      name: 'manageSpots',
      data: { action: 'list' },
      success: (res) => {
        if (res.result.success) {
          const spots = res.result.spots
          this.setData({ spots })
          this.calculateStats()
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
        typeName: '影视取景地',
        description: '鼎湖峰是仙都景区的核心景点，海拔170.8米，状如春笋，直刺云天，被誉为天下第一峰。',
        coverImage: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dinghu%20Peak%20in%20Xiandu%20Scenic%20Area&image_size=square',
        tags: ['仙剑奇侠传', '花千骨', '热门'],
        hotScore: 9.8,
        checkinCount: 1256,
        latitude: 28.656,
        longitude: 119.648
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
        longitude: 119.640
      }
    ]
    this.setData({ spots })
    this.calculateStats()
  },
  
  calculateStats() {
    const { spots } = this.data
    const totalSpots = spots.length
    const movieCount = spots.filter(s => s.type === 'movie').length
    const gameCount = spots.filter(s => s.type === 'game').length
    const totalCheckins = spots.reduce((sum, s) => sum + (s.checkinCount || 0), 0)
    
    this.setData({
      totalSpots,
      movieCount,
      gameCount,
      totalCheckins
    })
  },
  
  showAddModal() {
    this.setData({
      showModal: true,
      isEdit: false,
      editId: null,
      formData: {
        name: '',
        type: 'movie',
        coverImage: '',
        latitude: '',
        longitude: '',
        description: '',
        tagsStr: '',
        hotScore: '5.0'
      },
      typeIndex: 0
    })
  },
  
  editSpot(e) {
    const id = e.currentTarget.dataset.id
    const spot = this.data.spots.find(s => s.id === id)
    
    if (spot) {
      const typeIndex = this.data.typeOptions.findIndex(t => t.value === spot.type)
      this.setData({
        showModal: true,
        isEdit: true,
        editId: id,
        formData: {
          name: spot.name,
          type: spot.type,
          coverImage: spot.coverImage,
          latitude: spot.latitude.toString(),
          longitude: spot.longitude.toString(),
          description: spot.description,
          tagsStr: spot.tags ? spot.tags.join(',') : '',
          hotScore: spot.hotScore.toString()
        },
        typeIndex: typeIndex >= 0 ? typeIndex : 0
      })
    }
  },
  
  hideModal() {
    this.setData({ showModal: false })
  },
  
  onInputChange(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    this.setData({
      formData: { ...this.data.formData, [field]: value }
    })
  },
  
  onTypeChange(e) {
    const index = e.detail.value
    const type = this.data.typeOptions[index].value
    this.setData({
      typeIndex: index,
      formData: { ...this.data.formData, type }
    })
  },
  
  submitForm() {
    const { formData, isEdit, editId } = this.data
    
    if (!formData.name || !formData.description) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' })
      return
    }
    
    const spotData = {
      name: formData.name,
      type: formData.type,
      typeName: this.data.typeOptions.find(t => t.value === formData.type).label,
      coverImage: formData.coverImage || 'https://via.placeholder.com/200',
      latitude: parseFloat(formData.latitude) || 28.656,
      longitude: parseFloat(formData.longitude) || 119.648,
      description: formData.description,
      tags: formData.tagsStr ? formData.tagsStr.split(',').map(t => t.trim()) : [],
      hotScore: parseFloat(formData.hotScore) || 5.0,
      checkinCount: 0
    }
    
    const action = isEdit ? 'update' : 'add'
    const data = isEdit ? { id: editId, ...spotData } : spotData
    
    wx.cloud.callFunction({
      name: 'manageSpots',
      data: { action, data },
      success: (res) => {
        if (res.result.success) {
          wx.showToast({ title: isEdit ? '修改成功' : '添加成功', icon: 'success' })
          this.hideModal()
          this.loadSpots()
        } else {
          wx.showToast({ title: res.result.message || '操作失败', icon: 'none' })
        }
      },
      fail: (err) => {
        console.error('操作失败', err)
        wx.showToast({ title: '操作失败', icon: 'none' })
        this.hideModal()
      }
    })
  },
  
  deleteSpot(e) {
    const id = e.currentTarget.dataset.id
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个点位吗？',
      success: (res) => {
        if (res.confirm) {
          wx.cloud.callFunction({
            name: 'manageSpots',
            data: { action: 'delete', id },
            success: (res) => {
              if (res.result.success) {
                wx.showToast({ title: '删除成功', icon: 'success' })
                this.loadSpots()
              } else {
                wx.showToast({ title: res.result.message || '删除失败', icon: 'none' })
              }
            },
            fail: (err) => {
              console.error('删除失败', err)
              wx.showToast({ title: '删除失败', icon: 'none' })
            }
          })
        }
      }
    })
  },
  
  updateHotScore(e) {
    const id = e.currentTarget.dataset.id
    const spot = this.data.spots.find(s => s.id === id)
    
    if (spot) {
      const newHotScore = (Math.random() * 3 + 7).toFixed(1)
      
      wx.cloud.callFunction({
        name: 'manageSpots',
        data: { action: 'updateHotScore', id, hotScore: parseFloat(newHotScore) },
        success: (res) => {
          if (res.result.success) {
            wx.showToast({ title: '热度已更新', icon: 'success' })
            this.loadSpots()
          }
        },
        fail: (err) => {
          console.error('更新热度失败', err)
          wx.showToast({ title: '更新失败', icon: 'none' })
        }
      })
    }
  }
})
