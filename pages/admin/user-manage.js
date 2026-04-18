// pages/admin/user-manage.js
const { formatTime } = require('../../utils/index.js')

Page({
  data: {
    users: [],
    filteredUsers: [],
    totalUsers: 0,
    todayUsers: 0,
    activeUsers: 0,
    searchKeyword: '',
    showDetailModal: false,
    selectedUser: null
  },

  onLoad() {
    this.loadUsers()
  },

  onShow() {
    this.loadUsers()
  },

  loadUsers() {
    wx.cloud.callFunction({
      name: 'manageUsers',
      data: { action: 'list' },
      success: (res) => {
        if (res.result.success) {
          const users = this.processUsers(res.result.users)
          this.setData({ users, filteredUsers: users })
          this.calculateStats(users)
        }
      },
      fail: () => {
        this.loadLocalUsers()
      }
    })
  },

  loadLocalUsers() {
    const users = [
      {
        id: 'user1',
        nickName: '旅行达人',
        avatarUrl: 'https://via.placeholder.com/80',
        role: 'user',
        roleName: '普通用户',
        level: 3,
        totalChecks: 25,
        growthValue: 450,
        status: 'active',
        createdAt: Date.now() - 86400000 * 30,
        lastActive: Date.now() - 3600000
      },
      {
        id: 'user2',
        nickName: '摄影爱好者',
        avatarUrl: 'https://via.placeholder.com/80',
        role: 'user',
        roleName: '普通用户',
        level: 2,
        totalChecks: 15,
        growthValue: 200,
        status: 'active',
        createdAt: Date.now() - 86400000 * 15,
        lastActive: Date.now() - 7200000
      },
      {
        id: 'admin1',
        nickName: '管理员',
        avatarUrl: 'https://via.placeholder.com/80',
        role: 'admin',
        roleName: '管理员',
        level: 5,
        totalChecks: 50,
        growthValue: 1500,
        status: 'active',
        createdAt: Date.now() - 86400000 * 60,
        lastActive: Date.now() - 1800000
      }
    ]

    const processedUsers = this.processUsers(users)
    this.setData({ users: processedUsers, filteredUsers: processedUsers })
    this.calculateStats(processedUsers)
  },

  processUsers(users) {
    return users.map(user => ({
      ...user,
      createdAtText: formatTime(user.createdAt),
      lastActiveText: formatTime(user.lastActive)
    }))
  },

  calculateStats(users) {
    const totalUsers = users.length
    const today = new Date().setHours(0, 0, 0, 0)
    const todayUsers = users.filter(u => u.createdAt >= today).length
    const activeUsers = users.filter(u => Date.now() - u.lastActive < 7 * 24 * 60 * 60 * 1000).length

    this.setData({ totalUsers, todayUsers, activeUsers })
  },

  onSearch(e) {
    const keyword = e.detail.value.toLowerCase()
    this.setData({ searchKeyword: keyword })

    const filteredUsers = this.data.users.filter(user =>
      (user.nickName || '').toLowerCase().includes(keyword)
    )

    this.setData({ filteredUsers })
  },

  viewUserDetail(e) {
    const id = e.currentTarget.dataset.id
    const user = this.data.users.find(u => u.id === id)

    if (user) {
      this.setData({
        selectedUser: user,
        showDetailModal: true
      })
    }
  },

  hideDetailModal() {
    this.setData({ showDetailModal: false, selectedUser: null })
  },

  toggleUserStatus(e) {
    const { id, status } = e.currentTarget.dataset
    const newStatus = status === 'banned' ? 'active' : 'banned'
    const actionText = newStatus === 'banned' ? '禁用' : '解禁'

    wx.showModal({
      title: '确认操作',
      content: `确定要${actionText}该用户吗？`,
      success: (res) => {
        if (res.confirm) {
          const users = this.data.users.map(user => {
            if (user.id === id) {
              return { ...user, status: newStatus }
            }
            return user
          })

          this.setData({ users, filteredUsers: users })
          wx.showToast({ title: `${actionText}成功`, icon: 'success' })

          wx.cloud.callFunction({
            name: 'manageUsers',
            data: { action: 'updateStatus', userId: id, status: newStatus }
          })
        }
      }
    })
  },

  editUserRole(e) {
    const id = e.currentTarget.dataset.id
    const user = this.data.users.find(u => u.id === id)

    const roles = ['user', 'admin', 'super_admin']
    const currentIndex = roles.indexOf(user.role)
    const nextIndex = (currentIndex + 1) % roles.length
    const newRole = roles[nextIndex]
    const roleNames = { user: '普通用户', admin: '管理员', super_admin: '超级管理员' }

    const users = this.data.users.map(u => {
      if (u.id === id) {
        return { ...u, role: newRole, roleName: roleNames[newRole] }
      }
      return u
    })

    this.setData({ users, filteredUsers: users, selectedUser: { ...user, role: newRole, roleName: roleNames[newRole] } })
    wx.showToast({ title: '角色已更新', icon: 'success' })

    wx.cloud.callFunction({
      name: 'manageUsers',
      data: { action: 'updateRole', userId: id, role: newRole }
    })
  }
})
