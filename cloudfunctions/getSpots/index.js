// cloudfunctions/getSpots/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { category, sortType, limit, skip } = event
  
  try {
    let query = db.collection('spots')
    
    if (category && category !== 'all') {
      query = query.where({ type: category })
    }
    
    let orderByField = 'hotScore'
    if (sortType === 'checkin') {
      orderByField = 'checkinCount'
    } else if (sortType === 'createdAt') {
      orderByField = 'createdAt'
    }
    
    query = query.orderBy(orderByField, 'desc')
    
    if (limit) {
      query = query.limit(limit)
    }
    
    if (skip) {
      query = query.skip(skip)
    }
    
    const result = await query.get()
    
    return {
      success: true,
      spots: result.data
    }
  } catch (err) {
    console.error('获取点位列表失败', err)
    return {
      success: false,
      message: '获取点位列表失败'
    }
  }
}
