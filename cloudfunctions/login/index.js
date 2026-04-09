// cloudfunctions/login/index.js
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const { code } = event

  try {
    // 调用微信API获取openId
    const wxContext = cloud.getWXContext()
    const openId = wxContext.OPENID

    // 检查用户是否已存在
    const user = await db.collection('users').where({ openId }).get()

    if (user.data.length === 0) {
      // 创建新用户
      await db.collection('users').add({
        data: {
          openId,
          nickName: '用户',
          avatarUrl: '',
          totalChecks: 0,
          createdAt: new Date()
        }
      })
    }

    // 返回用户信息
    return {
      success: true,
      userInfo: {
        openId,
        nickName: user.data.length > 0 ? user.data[0].nickName : '用户',
        avatarUrl: user.data.length > 0 ? user.data[0].avatarUrl : ''
      }
    }
  } catch (err) {
    console.error('登录失败', err)
    return {
      success: false,
      message: '登录失败'
    }
  }
}