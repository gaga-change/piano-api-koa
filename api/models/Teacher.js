// 清单

const mongoose = require('mongoose')
const { Schema } = mongoose


const schema = new Schema({
  name: { type: String, default: '', trim: true }, // 名称
  school: { type: String, default: '', trim: true }, // 学校
  major : { type: String, default: '', trim: true }, // 专业
  grade : { type: Number,  }, // 等级
  type : { type: Number,  }, // 类型
  status : { type: Number,  }, // 状态
  phone: {type: String,}, // 手机号码
  openid: {type: String, }, // wx openId
  wx: {type: Schema.Types.Mixed,  }, // 微信用户信息
  remark: { type: String, default: '', trim: true }, // 备注
  createUser: { type: Object, default: null }, // 创建者
  modifyUser: { type: Object, default: null }, // 修改者
}, {
  timestamps: true,
})

module.exports = mongoose.model('teacher', schema, 'piano_teacher');