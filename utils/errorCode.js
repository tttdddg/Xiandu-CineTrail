// utils/errorCode.js
const ErrorCode = {
  SUCCESS: 0,
  
  // 通用错误 1xxx
  UNKNOWN_ERROR: 1000,
  NETWORK_ERROR: 1001,
  TIMEOUT_ERROR: 1002,
  PARAM_ERROR: 1003,
  
  // 用户相关 2xxx
  USER_NOT_LOGIN: 2001,
  USER_NOT_FOUND: 2002,
  USER_BANNED: 2003,
  PERMISSION_DENIED: 2004,
  
  // 点位相关 3xxx
  SPOT_NOT_FOUND: 3001,
  SPOT_ALREADY_EXISTS: 3002,
  SPOT_CHECKIN_LIMIT: 3003,
  SPOT_DISTANCE_LIMIT: 3004,
  
  // 打卡相关 4xxx
  CHECKIN_ALREADY_EXISTS: 4001,
  CHECKIN_NOT_FOUND: 4002,
  CHECKIN_PHOTO_REQUIRED: 4003,
  CHECKIN_MAKEUP_LIMIT: 4004,
  
  // 评论相关 5xxx
  COMMENT_NOT_FOUND: 5001,
  COMMENT_CONTENT_EMPTY: 5002,
  COMMENT_LIMIT_EXCEEDED: 5003,
  
  // 文件相关 6xxx
  FILE_UPLOAD_FAILED: 6001,
  FILE_SIZE_EXCEEDED: 6002,
  FILE_TYPE_NOT_ALLOWED: 6003,
  
  // 数据库相关 7xxx
  DB_ERROR: 7001,
  DB_QUERY_ERROR: 7002,
  DB_UPDATE_ERROR: 7003,
  DB_DELETE_ERROR: 7004
}

const ErrorMessage = {
  [ErrorCode.SUCCESS]: '操作成功',
  [ErrorCode.UNKNOWN_ERROR]: '未知错误',
  [ErrorCode.NETWORK_ERROR]: '网络错误',
  [ErrorCode.TIMEOUT_ERROR]: '请求超时',
  [ErrorCode.PARAM_ERROR]: '参数错误',
  [ErrorCode.USER_NOT_LOGIN]: '用户未登录',
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.USER_BANNED]: '用户已被禁用',
  [ErrorCode.PERMISSION_DENIED]: '权限不足',
  [ErrorCode.SPOT_NOT_FOUND]: '点位不存在',
  [ErrorCode.SPOT_ALREADY_EXISTS]: '点位已存在',
  [ErrorCode.SPOT_CHECKIN_LIMIT]: '打卡次数已达上限',
  [ErrorCode.SPOT_DISTANCE_LIMIT]: '距离点位太远',
  [ErrorCode.CHECKIN_ALREADY_EXISTS]: '已打卡过该点位',
  [ErrorCode.CHECKIN_NOT_FOUND]: '打卡记录不存在',
  [ErrorCode.CHECKIN_PHOTO_REQUIRED]: '请上传打卡照片',
  [ErrorCode.CHECKIN_MAKEUP_LIMIT]: '补签次数已达上限',
  [ErrorCode.COMMENT_NOT_FOUND]: '评论不存在',
  [ErrorCode.COMMENT_CONTENT_EMPTY]: '评论内容不能为空',
  [ErrorCode.COMMENT_LIMIT_EXCEEDED]: '评论次数已达上限',
  [ErrorCode.FILE_UPLOAD_FAILED]: '文件上传失败',
  [ErrorCode.FILE_SIZE_EXCEEDED]: '文件大小超过限制',
  [ErrorCode.FILE_TYPE_NOT_ALLOWED]: '文件类型不允许',
  [ErrorCode.DB_ERROR]: '数据库错误',
  [ErrorCode.DB_QUERY_ERROR]: '数据库查询错误',
  [ErrorCode.DB_UPDATE_ERROR]: '数据库更新错误',
  [ErrorCode.DB_DELETE_ERROR]: '数据库删除错误'
}

function getErrorMessage(code) {
  return ErrorMessage[code] || '未知错误'
}

function createError(code, message) {
  return {
    code: code,
    message: message || getErrorMessage(code),
    success: false
  }
}

function createSuccess(data, message) {
  return {
    code: ErrorCode.SUCCESS,
    message: message || getErrorMessage(ErrorCode.SUCCESS),
    data: data,
    success: true
  }
}

module.exports = {
  ErrorCode,
  ErrorMessage,
  getErrorMessage,
  createError,
  createSuccess
}
