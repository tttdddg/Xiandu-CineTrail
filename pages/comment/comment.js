// pages/comment/comment.js
const { formatTime, showToast, checkLogin } = require('../../utils/index.js')

Page({
  data: {
    spotId: null,
    comments: [],
    total: 0,
    inputContent: '',
    replyTo: '',
    replyToId: null,
    page: 1,
    pageSize: 20,
    hasMore: true
  },
  
  onLoad(options) {
    this.setData({ spotId: options.spotId })
    this.loadComments()
  },
  
  onReachBottom() {
    if (this.data.hasMore) {
      this.loadMoreComments()
    }
  },
  
  loadComments() {
    wx.cloud.callFunction({
      name: 'getComments',
      data: {
        spotId: this.data.spotId,
        page: 1,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        if (res.result.success) {
          const comments = this.processComments(res.result.comments)
          this.setData({ 
            comments,
            total: res.result.total,
            hasMore: comments.length < res.result.total
          })
        }
      },
      fail: () => {
        this.loadLocalComments()
      }
    })
  },
  
  loadLocalComments() {
    const comments = [
      {
        id: 1,
        userId: 'user1',
        userName: '旅行达人',
        userAvatar: 'https://via.placeholder.com/72',
        content: '这里风景真的太美了，强烈推荐大家来打卡！',
        likeCount: 128,
        isLiked: false,
        timestamp: Date.now() - 3600000,
        replyCount: 5,
        replies: [
          { id: 11, userName: '小明', content: '确实很美！' },
          { id: 12, userName: '小红', content: '下次我也要去' }
        ]
      },
      {
        id: 2,
        userId: 'user2',
        userName: '摄影爱好者',
        userAvatar: 'https://via.placeholder.com/72',
        content: '拍照效果超级好，随便一拍就是大片！',
        likeCount: 86,
        isLiked: true,
        timestamp: Date.now() - 7200000,
        replyCount: 0,
        replies: []
      }
    ]
    
    this.setData({ 
      comments: this.processComments(comments),
      total: comments.length,
      hasMore: false
    })
  },
  
  processComments(comments) {
    return comments.map(comment => ({
      ...comment,
      timeText: formatTime(comment.timestamp)
    }))
  },
  
  loadMoreComments() {
    const page = this.data.page + 1
    
    wx.cloud.callFunction({
      name: 'getComments',
      data: {
        spotId: this.data.spotId,
        page,
        pageSize: this.data.pageSize
      },
      success: (res) => {
        if (res.result.success) {
          const newComments = this.processComments(res.result.comments)
          this.setData({
            comments: [...this.data.comments, ...newComments],
            page,
            hasMore: newComments.length === this.data.pageSize
          })
        }
      }
    })
  },
  
  onInput(e) {
    this.setData({ inputContent: e.detail.value })
  },
  
  submitComment() {
    if (!this.data.inputContent.trim()) {
      showToast('请输入评论内容')
      return
    }
    
    if (!checkLogin()) {
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }
    
    const userInfo = wx.getStorageSync('userInfo')
    const content = this.data.inputContent.trim()
    
    wx.showLoading({ title: '发送中...' })
    
    wx.cloud.callFunction({
      name: 'addComment',
      data: {
        spotId: this.data.spotId,
        content,
        replyToId: this.data.replyToId
      },
      success: (res) => {
        wx.hideLoading()
        
        if (res.result.success) {
          showToast('评论成功')
          
          const newComment = {
            id: Date.now(),
            userId: userInfo.openId,
            userName: userInfo.nickName || '用户',
            userAvatar: userInfo.avatarUrl,
            content,
            likeCount: 0,
            isLiked: false,
            timestamp: Date.now(),
            replyCount: 0,
            replies: [],
            timeText: '刚刚'
          }
          
          this.setData({
            comments: [newComment, ...this.data.comments],
            total: this.data.total + 1,
            inputContent: '',
            replyTo: '',
            replyToId: null
          })
        } else {
          showToast(res.result.message || '评论失败')
        }
      },
      fail: () => {
        wx.hideLoading()
        
        const userInfo = wx.getStorageSync('userInfo')
        const newComment = {
          id: Date.now(),
          userId: userInfo.openId,
          userName: userInfo.nickName || '用户',
          userAvatar: userInfo.avatarUrl,
          content,
          likeCount: 0,
          isLiked: false,
          timestamp: Date.now(),
          replyCount: 0,
          replies: [],
          timeText: '刚刚'
        }
        
        this.setData({
          comments: [newComment, ...this.data.comments],
          total: this.data.total + 1,
          inputContent: '',
          replyTo: '',
          replyToId: null
        })
        
        showToast('评论成功（本地）')
      }
    })
  },
  
  likeComment(e) {
    const id = e.currentTarget.dataset.id
    const comments = this.data.comments
    const comment = comments.find(c => c.id === id)
    
    if (comment) {
      comment.isLiked = !comment.isLiked
      comment.likeCount += comment.isLiked ? 1 : -1
      this.setData({ comments })
      
      wx.cloud.callFunction({
        name: 'likeComment',
        data: { commentId: id, isLike: comment.isLiked }
      })
    }
  },
  
  replyComment(e) {
    const { id, name } = e.currentTarget.dataset
    this.setData({
      replyTo: name,
      replyToId: id
    })
  },
  
  viewMoreReplies(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/reply/reply?commentId=${id}`
    })
  }
})
