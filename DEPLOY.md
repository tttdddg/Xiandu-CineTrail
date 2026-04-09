# 部署说明

## 1. 替换云环境ID

1. 打开 `app.js` 文件
2. 将 `YOUR_ENV_ID` 替换为实际的云环境ID

```javascript
// app.js
wx.cloud.init({
  env: 'YOUR_ENV_ID', // 替换为实际的云环境ID
  traceUser: true
})
```

## 2. 创建数据库集合

在微信开发者工具的云开发控制台中创建以下集合：

### 2.1 users 集合
- 用途：存储用户信息
- 字段：
  - openId: 字符串，用户唯一标识
  - nickName: 字符串，用户昵称
  - avatarUrl: 字符串，用户头像
  - totalChecks: 数字，累计打卡数
  - createdAt: 时间，创建时间

### 2.2 spots 集合
- 用途：存储点位信息
- 预置数据：
  1. 鼎湖峰
     - _id: 1
     - name: "鼎湖峰"
     - type: "movie"
     - description: "鼎湖峰是仙都景区的核心景点，海拔170.8米，状如春笋，直刺云天，被誉为\"天下第一峰\"。这里曾是《仙剑奇侠传》、《花千骨》等多部热门影视剧的取景地，自然风光秀美，文化底蕴深厚。"
     - coverImage: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dinghu%20Peak%20in%20Xiandu%20Scenic%20Area%20with%20tall%20mountain%20and%20clear%20water&image_size=landscape_16_9"
  
  2. 时思寺
     - _id: 2
     - name: "时思寺"
     - type: "game"
     - description: "时思寺是一座历史悠久的古刹，建于北宋时期，建筑风格独特，环境清幽。这里与《梦幻西游》、《大话西游》等游戏中的场景极为相似，是游戏玩家的打卡圣地。"
     - coverImage: "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shisi%20Temple%20ancient%20Buddhist%20temple%20with%20traditional%20Chinese%20architecture&image_size=landscape_16_9"

### 2.3 checkins 集合
- 用途：存储打卡记录
- 字段：
  - _id: 自动生成
  - userId: 字符串，用户openId
  - spotId: 数字，点位ID
  - timestamp: 数字，打卡时间戳
  - createdAt: 时间，创建时间

## 3. 上传云函数

1. 在微信开发者工具中，右键点击 `cloudfunctions` 目录
2. 选择 "同步云函数列表"
3. 分别右键点击每个云函数（login、addCheckin、getMyCheckins）
4. 选择 "上传并部署：云端安装依赖"

## 4. 测试小程序

1. 在微信开发者工具中点击 "预览"
2. 使用微信扫码查看小程序效果
3. 测试登录、打卡、查看记录等功能

## 5. 注意事项

- 确保云环境已正确配置
- 确保数据库集合已正确创建
- 确保云函数已正确部署
- 测试时请确保网络连接正常
