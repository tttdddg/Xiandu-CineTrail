// cloudfunctions/social/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()
  const openId = wxContext.OPENID
  
  switch (action) {
    case 'like':
      return await handleLike(openId, data)
    case 'unlike':
      return await handleUnlike(openId, data)
    case 'favorite':
      return await handleFavorite(openId, data)
    case 'unfavorite':
      return await handleUnfavorite(openId, data)
    case 'getFavorites':
      return await getFavorites(openId, data)
    case 'checkLike':
      return await checkLike(openId, data)
    case 'checkFavorite':
      return await checkFavorite(openId, data)
    default:
      return { success: false, message: '未知操作' }
  }
}

async function handleLike(openId, data) {
  const { spotId, commentId } = data
  
  try {
    const collection = commentId ? 'comment_likes' : 'spot_likes'
    const targetId = commentId || spotId
    const targetField = commentId ? 'commentId' : 'spotId'
    
    const existing = await db.collection(collection)
      .where({ userId: openId, [targetField]: targetId })
      .get()
    
    if (existing.data.length > 0) {
      return { success: false, message: '已点赞' }
    }
    
    await db.collection(collection).add({
      data: {
        userId: openId,
        [targetField]: targetId,
        createdAt: new Date()
      }
    })
    
    if (commentId) {
      await db.collection('comments').doc(commentId).update({
        data: { likeCount: db.command.inc(1) }
      })
    } else {
      await db.collection('spots').doc(spotId).update({
        data: { likeCount: db.command.inc(1) }
      })
    }
    
    return { success: true, message: '点赞成功' }
  } catch (err) {
    console.error('点赞失败', err)
    return { success: false, message: '点赞失败' }
  }
}

async function handleUnlike(openId, data) {
  const { spotId, commentId } = data
  
  try {
    const collection = commentId ? 'comment_likes' : 'spot_likes'
    const targetId = commentId || spotId
    const targetField = commentId ? 'commentId' : 'spotId'
    
    await db.collection(collection)
      .where({ userId: openId, [targetField]: targetId })
      .remove()
    
    if (commentId) {
      await db.collection('comments').doc(commentId).update({
        data: { likeCount: db.command.inc(-1) }
      })
    } else {
      await db.collection('spots').doc(spotId).update({
        data: { likeCount: db.command.inc(-1) }
      })
    }
    
    return { success: true, message: '取消点赞成功' }
  } catch (err) {
    console.error('取消点赞失败', err)
    return { success: false, message: '取消点赞失败' }
  }
}

async function handleFavorite(openId, data) {
  const { spotId } = data
  
  try {
    const existing = await db.collection('favorites')
      .where({ userId: openId, spotId })
      .get()
    
    if (existing.data.length > 0) {
      return { success: false, message: '已收藏' }
    }
    
    await db.collection('favorites').add({
      data: {
        userId: openId,
        spotId,
        createdAt: new Date()
      }
    })
    
    await db.collection('spots').doc(spotId).update({
      data: { favoriteCount: db.command.inc(1) }
    })
    
    return { success: true, message: '收藏成功' }
  } catch (err) {
    console.error('收藏失败', err)
    return { success: false, message: '收藏失败' }
  }
}

async function handleUnfavorite(openId, data) {
  const { spotId } = data
  
  try {
    await db.collection('favorites')
      .where({ userId: openId, spotId })
      .remove()
    
    await db.collection('spots').doc(spotId).update({
      data: { favoriteCount: db.command.inc(-1) }
    })
    
    return { success: true, message: '取消收藏成功' }
  } catch (err) {
    console.error('取消收藏失败', err)
    return { success: false, message: '取消收藏失败' }
  }
}

async function getFavorites(openId, data) {
  const { page = 1, pageSize = 20 } = data
  
  try {
    const skip = (page - 1) * pageSize
    
    const favorites = await db.collection('favorites')
      .where({ userId: openId })
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
    
    const spotIds = favorites.data.map(f => f.spotId)
    
    if (spotIds.length > 0) {
      const spots = await db.collection('spots')
        .where({ _id: db.command.in(spotIds) })
        .get()
      
      const spotMap = {}
      spots.data.forEach(spot => {
        spotMap[spot._id] = spot
      })
      
      const result = favorites.data.map(f => ({
        ...spotMap[f.spotId],
        favoriteTime: f.createdAt
      }))
      
      return { success: true, favorites: result }
    }
    
    return { success: true, favorites: [] }
  } catch (err) {
    console.error('获取收藏列表失败', err)
    return { success: false, message: '获取收藏列表失败' }
  }
}

async function checkLike(openId, data) {
  const { spotId, commentId } = data
  
  try {
    const collection = commentId ? 'comment_likes' : 'spot_likes'
    const targetId = commentId || spotId
    const targetField = commentId ? 'commentId' : 'spotId'
    
    const result = await db.collection(collection)
      .where({ userId: openId, [targetField]: targetId })
      .get()
    
    return { success: true, isLiked: result.data.length > 0 }
  } catch (err) {
    console.error('检查点赞状态失败', err)
    return { success: false, isLiked: false }
  }
}

async function checkFavorite(openId, data) {
  const { spotId } = data
  
  try {
    const result = await db.collection('favorites')
      .where({ userId: openId, spotId })
      .get()
    
    return { success: true, isFavorited: result.data.length > 0 }
  } catch (err) {
    console.error('检查收藏状态失败', err)
    return { success: false, isFavorited: false }
  }
}
