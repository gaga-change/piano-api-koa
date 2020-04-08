// 清单

const mongoose = require('mongoose')
const { Schema } = mongoose


const schema = new Schema({
  startTime: { type: Date, }, // 开始时间
  endTime: { type: Date }, // 结束时间，
  date: { type: Date, }, // 日期
  teacher: { type: Schema.Types.ObjectId, ref: 'teacher' },
  student: { type: Schema.Types.ObjectId, ref: 'student' },
  tag: { type: Number, }, // 标记
  status: { type: Number, }, // 状态
  classType: { type: Number, }, // 课类型
  classTime: { type: Number, }, // 课时长
  remark: { type: String, default: '', trim: true }, // 备注
  createUser: { type: Object, default: null }, // 创建者
  modifyUser: { type: Object, default: null }, // 修改者
}, {
  timestamps: true,
})

module.exports = mongoose.model('course', schema, 'piano_space_course');