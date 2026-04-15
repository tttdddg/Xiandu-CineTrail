// pages/message/message.js
const { formatTime } = require('../../utils/index.js')

Page({
  data: {
    messages: [],
    filteredMessages: [],
    currentTab: 'all'
  },
  
  onLoad() {
    this.loadMessages()
  },
  
  onShow() {
    this.loadMessages()
  },
  
  loadMessages() {
    const messages = wx.getStorageSync('messages') || [
      {
        id: 1,
        type: 'system',
        title: '系统通知',
        content: '欢迎使用仙都影游打卡小程序，祝您旅途愉快！',
        timestamp: Date.now() - 3600000,
        isRead: false
      },
      {
        id: 2,
        type: 'like',
        title: '点赞通知',
        content: '用户小明赞了您在鼎湖峰的打卡',
        timestamp: Date.now() - 7200000,
        isRead: false
      },
      {
        id: 3,
        type: 'comment',
        title: '评论通知',
        content: '用户小红评论了您的打卡：风景真美！',
        timestamp: Date.now() - 86400000,
        isRead: true
      }
    ]
    
    const processedMessages = messages.map(msg => ({
      ...msg,
      timeText: formatTime(msg.timestamp)
    }))
    
    this.setData({ messages: processedMessages })
    this.filterMessages()
  },
  
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ currentTab: tab })
    this.filterMessages()
  },
  
  filterMessages() {
    const { messages, currentTab } = this.data
    
    let filtered = messages
    if (currentTab !== 'all') {
      filtered = messages.filter(msg => msg.type === currentTab)
    }
    
    this.setData({ filteredMessages: filtered })
  },
  
  viewMessage(e) {
    const id = e.currentTarget.dataset.id
    const messages = this.data.messages
    const message = messages.find(m => m.id === id)
    
    if (message && !message.isRead) {
      message.isRead = true
      this.setData({ messages })
      wx.setStorageSync('messages', messages)
      this.filterMessages()
    }
    
    if (message.type === 'like' || message.type === 'comment') {
      wx.navigateTo({
        url: `/pages/detail/detail?id=${message.spotId || 1}`
      })
    }
  },
  
  markAllRead() {
    const messages = this.data.messages.map(msg => ({
      ...msg,
      isRead: true
    }))
    
    this.setData({ messages })
    wx.setStorageSync('messages', messages)
    this.filterMessages()
    
    wx.showToast({ title: '已全部标记为已读', icon: 'success' })
  },
  
  clearAllMessages() {
    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有消息吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({ 
            messages: [],
            filteredMessages: []
          })
          wx.setStorageSync('messages', [])
          wx.showToast({ title: '已清空', icon: 'success' })
        }
      }
    })
  }
})
