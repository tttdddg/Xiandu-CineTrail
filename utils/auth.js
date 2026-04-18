// utils/auth.js
const { ErrorCode, createError, createSuccess } = require('./errorCode.js')
const { logger } = require('./logger.js')

const UserRole = {
  GUEST: 0,
  USER: 1,
  VIP: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4
}

const RoleName = {
  [UserRole.GUEST]: '游客',
  [UserRole.USER]: '普通用户',
  [UserRole.VIP]: 'VIP用户',
  [UserRole.ADMIN]: '管理员',
  [UserRole.SUPER_ADMIN]: '超级管理员'
}

function checkLogin() {
  const userInfo = wx.getStorageSync('userInfo')
  return !!userInfo && !!userInfo.openId
}

function getUserInfo() {
  return wx.getStorageSync('userInfo') || null
}

function getUserRole() {
  const userInfo = getUserInfo()
  if (!userInfo) return UserRole.GUEST
  return userInfo.role || UserRole.USER
}

function requireLogin() {
  return new Promise((resolve, reject) => {
    if (checkLogin()) {
      resolve(getUserInfo())
    } else {
      wx.showModal({
        title: '提示',
        content: '该功能需要登录后才能使用',
        confirmText: '去登录',
        success: (res) => {
          if (res.confirm) {
            wx.navigateTo({ url: '/pages/login/login' })
          }
        }
      })
      reject(createError(ErrorCode.USER_NOT_LOGIN))
    }
  })
}

function requireRole(minRole) {
  return new Promise((resolve, reject) => {
    const userRole = getUserRole()

    if (userRole >= minRole) {
      resolve(getUserInfo())
    } else {
      const roleName = RoleName[minRole] || '更高权限'
      wx.showToast({
        title: `需要${roleName}权限`,
        icon: 'none'
      })
      reject(createError(ErrorCode.PERMISSION_DENIED))
    }
  })
}

function requireAdmin() {
  return requireRole(UserRole.ADMIN)
}

function checkPermission(permission) {
  const userInfo = getUserInfo()
  if (!userInfo) return false

  const permissions = userInfo.permissions || []
  return permissions.includes(permission) || permissions.includes('*')
}

function withAuth(handler, options = {}) {
  const { minRole = UserRole.USER, permission = null } = options

  return async function (event, context) {
    try {
      if (minRole > UserRole.GUEST) {
        await requireRole(minRole)
      }

      if (permission && !checkPermission(permission)) {
        throw createError(ErrorCode.PERMISSION_DENIED)
      }

      return await handler(event, context)
    } catch (error) {
      logger.error('权限验证失败', error)
      return error
    }
  }
}

function canManageSpots() {
  const role = getUserRole()
  return role >= UserRole.ADMIN
}

function canReviewContent() {
  const role = getUserRole()
  return role >= UserRole.ADMIN
}

function canManageUsers() {
  const role = getUserRole()
  return role >= UserRole.SUPER_ADMIN
}

module.exports = {
  UserRole,
  RoleName,
  checkLogin,
  getUserInfo,
  getUserRole,
  requireLogin,
  requireRole,
  requireAdmin,
  checkPermission,
  withAuth,
  canManageSpots,
  canReviewContent,
  canManageUsers
}
