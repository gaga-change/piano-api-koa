/**
 * 站点相关配置文件
 */

const config = {
  // 端口
  PORT: process.env.PORT || '8680',
  // 数据库连接地址
  // MONGO_LINK: 'mongodb://localhost:27017/test'
  // MONGO_LINK: 'mongodb://gaga:kuaile@192.168.1.28:30017/pianotest'
  MONGO_LINK: 'mongodb://192.168.2.173:30201,192.168.2.173:30202,192.168.2.173:30203/pianotest'
}

module.exports = config