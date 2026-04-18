// utils/logger.js
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
}

class Logger {
  constructor(options = {}) {
    this.level = options.level || LogLevel.DEBUG
    this.prefix = options.prefix || '[App]'
    this.enableConsole = options.enableConsole !== false
    this.enableStorage = options.enableStorage || false
    this.maxLogs = options.maxLogs || 100
    this.storageKey = options.storageKey || 'app_logs'
  }

  _formatTime() {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`
  }

  _formatMessage(level, message, data) {
    const time = this._formatTime()
    const levelStr = ['DEBUG', 'INFO', 'WARN', 'ERROR'][level] || 'LOG'
    let logMessage = `${time} ${this.prefix} [${levelStr}] ${message}`
    
    if (data !== undefined) {
      logMessage += ` | Data: ${JSON.stringify(data)}`
    }
    
    return logMessage
  }

  _saveToStorage(level, message, data) {
    if (!this.enableStorage) return
    
    try {
      const logs = wx.getStorageSync(this.storageKey) || []
      logs.push({
        level,
        message,
        data,
        time: Date.now()
      })
      
      if (logs.length > this.maxLogs) {
        logs.splice(0, logs.length - this.maxLogs)
      }
      
      wx.setStorageSync(this.storageKey, logs)
    } catch (e) {
      console.error('保存日志失败', e)
    }
  }

  debug(message, data) {
    if (this.level > LogLevel.DEBUG) return
    const logMessage = this._formatMessage(LogLevel.DEBUG, message, data)
    if (this.enableConsole) console.log(logMessage)
    this._saveToStorage(LogLevel.DEBUG, message, data)
  }

  info(message, data) {
    if (this.level > LogLevel.INFO) return
    const logMessage = this._formatMessage(LogLevel.INFO, message, data)
    if (this.enableConsole) console.info(logMessage)
    this._saveToStorage(LogLevel.INFO, message, data)
  }

  warn(message, data) {
    if (this.level > LogLevel.WARN) return
    const logMessage = this._formatMessage(LogLevel.WARN, message, data)
    if (this.enableConsole) console.warn(logMessage)
    this._saveToStorage(LogLevel.WARN, message, data)
  }

  error(message, data) {
    if (this.level > LogLevel.ERROR) return
    const logMessage = this._formatMessage(LogLevel.ERROR, message, data)
    if (this.enableConsole) console.error(logMessage)
    this._saveToStorage(LogLevel.ERROR, message, data)
  }

  getLogs() {
    return wx.getStorageSync(this.storageKey) || []
  }

  clearLogs() {
    wx.removeStorageSync(this.storageKey)
  }

  exportLogs() {
    const logs = this.getLogs()
    return logs.map(log => 
      `${new Date(log.time).toISOString()} [${['DEBUG', 'INFO', 'WARN', 'ERROR'][log.level]}] ${log.message}${log.data ? ' | ' + JSON.stringify(log.data) : ''}`
    ).join('\n')
  }
}

const logger = new Logger({
  level: LogLevel.DEBUG,
  prefix: '[仙都打卡]',
  enableConsole: true,
  enableStorage: true
})

module.exports = {
  Logger,
  LogLevel,
  logger
}
