// cloudfunctions/addCheckin/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { spotId } = event
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  try {
    // 检查是否已打卡
    const existingCheckin = await db.collection('checkins')
      .where({ userId: openId, spotId })
      .get()
    
    if (existingCheckin.data.length > 0) {
      return {
        success: false,
        message: '您已打卡过此点位'
      }
    }
    
    // 添加打卡记录
    await db.collection('checkins').add({
      data: {
        userId: openId,
        spotId,
        timestamp: Date.now(),
        createdAt: new Date()
      }
    })
    
    // 更新用户打卡总数
    await db.collection('users').where({ openId }).update({
      data: {
        totalChecks: db.command.inc(1)
      }
    })
    
    return {
      success: true,
      message: '打卡成功'
    }
  } catch (err) {
    console.error('打卡失败', err)
    return {
      success: false,
      message: '打卡失败，请重试'
    }
  }
}