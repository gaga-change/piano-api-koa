// 清单

const mongoose = require('mongoose')
const { Schema } = mongoose


const schema = new Schema({
  startTime: { type: Date, }, // 开始时间
  endTime: { type: Date }, // 结束时间，
  week: { type: Number, }, // 周几： 【1~7】,
  teacher: { type: Schema.Types.ObjectId, ref: 'teacher' },
  student: { type: Schema.Types.ObjectId, ref: 'student' },
  remark: { type: String, default: '', trim: true }, // 备注
  createUser: { type: Object, default: null }, // 创建者
  modifyUser: { type: Object, default: null }, // 修改者
}, {
  timestamps: true,
})

module.exports = mongoose.model('spaceRule', schema, 'piano_space_rule');