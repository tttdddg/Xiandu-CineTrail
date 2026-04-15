// utils/request.js
const { ErrorCode, createError, createSuccess } = require('./errorCode.js')
const { logger } = require('./logger.js')

class Request {
  constructor(options = {}) {
    this.baseURL = options.baseURL || ''
    this.timeout = options.timeout || 10000
    this.headers = options.headers || {}
  }

  _getAuthHeader() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo && userInfo.token) {
      return { 'Authorization': `Bearer ${userInfo.token}` }
    }
    return {}
  }

  _handleError(error) {
    logger.error('请求错误', error)
    
    if (error.errMsg && error.errMsg.includes('timeout')) {
      return createError(ErrorCode.TIMEOUT_ERROR)
    }
    
    if (error.errMsg && error.errMsg.includes('fail')) {
      return createError(ErrorCode.NETWORK_ERROR)
    }
    
    return createError(ErrorCode.UNKNOWN_ERROR, error.errMsg || '请求失败')
  }

  _interceptResponse(response) {
    const { statusCode, data } = response
    
    if (statusCode === 401) {
      wx.removeStorageSync('userInfo')
      wx.navigateTo({ url: '/pages/login/login' })
      return createError(ErrorCode.USER_NOT_LOGIN)
    }
    
    if (statusCode === 403) {
      return createError(ErrorCode.PERMISSION_DENIED)
    }
    
    if (statusCode === 404) {
      return createError(ErrorCode.UNKNOWN_ERROR, '资源不存在')
    }
    
    if (statusCode >= 500) {
      return createError(ErrorCode.UNKNOWN_ERROR, '服务器错误')
    }
    
    if (data && data.code !== undefined) {
      return data
    }
    
    return createSuccess(data)
  }

  request(options) {
    const { url, method = 'GET', data, header = {} } = options
    
    const fullURL = this.baseURL + url
    const authHeader = this._getAuthHeader()
    
    const requestHeader = {
      'Content-Type': 'application/json',
      ...this.headers,
      ...authHeader,
      ...header
    }
    
    logger.debug(`请求: ${method} ${url}`, data)
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: fullURL,
        method,
        data,
        header: requestHeader,
        timeout: this.timeout,
        success: (res) => {
          const result = this._interceptResponse(res)
          logger.debug(`响应: ${method} ${url}`, result)
          
          if (result.success || result.code === ErrorCode.SUCCESS) {
            resolve(result)
          } else {
            reject(result)
          }
        },
        fail: (err) => {
          const error = this._handleError(err)
          reject(error)
        }
      })
    })
  }

  get(url, data, options = {}) {
    return this.request({
      url,
      method: 'GET',
      data,
      ...options
    })
  }

  post(url, data, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    })
  }

  put(url, data, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    })
  }

  delete(url, data, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    })
  }
}

const request = new Request({
  timeout: 15000
})

module.exports = {
  Request,
  request
}
