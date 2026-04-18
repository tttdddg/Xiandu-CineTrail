// cloudfunctions/manageSpots/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { action, data, id } = event
  const wxContext = cloud.getWXContext()
  
  switch (action) {
    case 'list':
      return await listSpots()
    case 'add':
      return await addSpot(data)
    case 'update':
      return await updateSpot(id, data)
    case 'delete':
      return await deleteSpot(id)
    case 'updateHotScore':
      return await updateHotScore(id, data.hotScore)
    default:
      return { success: false, message: '未知操作' }
  }
}

async function listSpots() {
  try {
    const result = await db.collection('spots').get()
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

async function addSpot(data) {
  try {
    const spotData = {
      ...data,
      checkinCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await db.collection('spots').add({ data: spotData })
    
    return {
      success: true,
      id: result._id,
      message: '添加成功'
    }
  } catch (err) {
    console.error('添加点位失败', err)
    return {
      success: false,
      message: '添加点位失败'
    }
  }
}

async function updateSpot(id, data) {
  try {
    const updateData = {
      ...data,
      updatedAt: new Date()
    }
    
    await db.collection('spots').doc(id).update({ data: updateData })
    
    return {
      success: true,
      message: '更新成功'
    }
  } catch (err) {
    console.error('更新点位失败', err)
    return {
      success: false,
      message: '更新点位失败'
    }
  }
}

async function deleteSpot(id) {
  try {
    await db.collection('spots').doc(id).remove()
    
    return {
      success: true,
      message: '删除成功'
    }
  } catch (err) {
    console.error('删除点位失败', err)
    return {
      success: false,
      message: '删除点位失败'
    }
  }
}

async function updateHotScore(id, hotScore) {
  try {
    await db.collection('spots').doc(id).update({
      data: {
        hotScore: hotScore,
        updatedAt: new Date()
      }
    })
    
    return {
      success: true,
      message: '热度更新成功'
    }
  } catch (err) {
    console.error('更新热度失败', err)
    return {
      success: false,
      message: '更新热度失败'
    }
  }
}
