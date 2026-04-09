// cloudfunctions/getMyCheckins/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    // 获取用户打卡记录
    const checkins = await db.collection('checkins')
      .where({ userId: openId })
      .orderBy('timestamp', 'desc')
      .get()
    
    // 转换为前端需要的格式
    const formattedCheckins = checkins.data.map(item => {
      const date = new Date(item.timestamp)
      const timeStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
      return {
        spotName: item.spotId === 1 ? '鼎湖峰' : '时思寺',
        checkinTime: timeStr
      }
    })
    
    return {
      success: true,
      checkins: formattedCheckins
    }
  } catch (err) {
    console.error('获取打卡记录失败', err)
    return {
      success: false,
      message: '获取打卡记录失败'
    }
  }
}