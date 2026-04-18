// utils/index.js
const { ErrorCode, ErrorMessage, getErrorMessage, createError, createSuccess } = require('./errorCode.js')
const { Logger, LogLevel, logger } = require('./logger.js')
const { Request, request } = require('./request.js')
const { 
  UserRole, RoleName, checkLogin, getUserInfo, getUserRole,
  requireLogin, requireRole, requireAdmin, checkPermission,
  withAuth, canManageSpots, canReviewContent, canManageUsers
} = require('./auth.js')
const util = require('./util.js')

module.exports = {
  ErrorCode,
  ErrorMessage,
  getErrorMessage,
  createError,
  createSuccess,
  Logger,
  LogLevel,
  logger,
  Request,
  request,
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
  canManageUsers,
  ...util
}
