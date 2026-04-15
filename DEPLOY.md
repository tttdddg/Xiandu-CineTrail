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
  - continuousDays: 数字，连续打卡天数
  - lastCheckinDate: 时间，最后打卡日期
  - createdAt: 时间，创建时间
  - updatedAt: 时间，更新时间

### 2.2 spots 集合
- 用途：存储点位信息
- 字段：
  - _id: 自动生成或手动指定
  - name: 字符串，点位名称
  - type: 字符串，点位类型（movie/game/culture/nature）
  - typeName: 字符串，类型名称
  - description: 字符串，详细描述
  - coverImage: 字符串，封面图片URL
  - latitude: 数字，纬度
  - longitude: 数字，经度
  - tags: 数组，标签列表
  - hotScore: 数字，热度值（0-10）
  - checkinCount: 数字，打卡总数
  - createdAt: 时间，创建时间
  - updatedAt: 时间，更新时间

- 预置数据示例：
  1. 鼎湖峰
     ```json
     {
       "name": "鼎湖峰",
       "type": "movie",
       "typeName": "影视取景地",
       "description": "鼎湖峰是仙都景区的核心景点，海拔170.8米，状如春笋，直刺云天，被誉为天下第一峰。这里曾是《仙剑奇侠传》、《花千骨》等多部热门影视剧的取景地，自然风光秀美，文化底蕴深厚。",
       "coverImage": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dinghu%20Peak%20in%20Xiandu%20Scenic%20Area&image_size=square",
       "latitude": 28.656,
       "longitude": 119.648,
       "tags": ["仙剑奇侠传", "花千骨", "热门"],
       "hotScore": 9.8,
       "checkinCount": 0
     }
     ```
  
  2. 时思寺
     ```json
     {
       "name": "时思寺",
       "type": "game",
       "typeName": "游戏IP关联点",
       "description": "时思寺是一座历史悠久的古刹，建于北宋时期，建筑风格独特，环境清幽。这里与《梦幻西游》、《大话西游》等游戏中的场景极为相似，是游戏玩家的打卡圣地。",
       "coverImage": "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Shisi%20Temple%20ancient%20Buddhist%20temple&image_size=square",
       "latitude": 28.650,
       "longitude": 119.640,
       "tags": ["梦幻西游", "大话西游", "古建筑"],
       "hotScore": 8.5,
       "checkinCount": 0
     }
     ```

### 2.3 checkins 集合
- 用途：存储打卡记录
- 字段：
  - _id: 自动生成
  - userId: 字符串，用户openId
  - spotId: 数字，点位ID
  - photos: 数组，打卡照片URL列表
  - reviewStatus: 字符串，审核状态（pending/approved/rejected）
  - isMakeup: 布尔，是否为补签
  - makeupReason: 字符串，补签原因
  - location: 对象，打卡位置
    - latitude: 数字，纬度
    - longitude: 数字，经度
  - timestamp: 数字，打卡时间戳
  - createdAt: 时间，创建时间

### 2.4 checkin-photos 存储桶
- 用途：存储打卡照片
- 在云开发控制台的"存储"中创建
- 文件命名规则：`checkin-photos/{timestamp}-{index}.jpg`

## 3. 上传云函数

1. 在微信开发者工具中，右键点击 `cloudfunctions` 目录
2. 选择 "同步云函数列表"
3. 分别右键点击每个云函数：
   - login
   - addCheckin
   - getMyCheckins
   - manageSpots
   - getSpots
4. 选择 "上传并部署：云端安装依赖"

## 4. 配置权限

在云开发控制台的"设置"->"权限设置"中，配置以下权限：

### 4.1 数据库权限
- users: 仅创建者可读写
- spots: 所有用户可读，仅创建者可写
- checkins: 仅创建者可读写

### 4.2 存储权限
- checkin-photos: 仅创建者可读写

## 5. 测试小程序

1. 在微信开发者工具中点击 "预览"
2. 使用微信扫码查看小程序效果
3. 测试以下功能：
   - 登录功能
   - 地图浏览和点位标记
   - 点位列表和筛选
   - 打卡功能（包括拍照上传）
   - 补签申请
   - 个人中心打卡记录
   - 后台管理功能

## 6. 注意事项

- 确保云环境已正确配置
- 确保数据库集合已正确创建
- 确保云函数已正确部署
- 测试时请确保网络连接正常
- 打卡功能需要定位权限，请确保在真机上测试
- 照片上传功能需要相机和相册权限

## 7. 功能清单

### 7.1 点位数据中心
- ✅ 后台管理页面（增删改查）
- ✅ 分类标签功能
- ✅ 热度统计功能
- ✅ 点位列表展示
- ✅ 搜索和筛选功能

### 7.2 地图增强
- ✅ 聚合点功能
- ✅ 定位权限获取
- ✅ 附近推荐功能
- ✅ 路线规划功能
- ✅ 导航功能

### 7.3 打卡增强
- ✅ 拍照上传功能
- ✅ 图片审核状态
- ✅ 补签规则
- ✅ 连续打卡统计
- ✅ 距离验证
