// 清单

const mongoose = require('mongoose')
const { Schema } = mongoose
const { initHour } = require('../tools')

const schema = new Schema({
  startTime: { type: Date, }, // 开始时间
  endTime: { type: Date }, // 结束时间，
  // date: { type: Date, }, // 日期
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  teacherSpaceRule: { type: Schema.Types.ObjectId, ref: 'SpaceRule' },
  studentSpaceRule: { type: Schema.Types.ObjectId, ref: 'SpaceRule' },
  teacherTag: { type: Number }, // 老师标签
  studentTag: { type: Number }, // 学生标签
  status: { type: Number, }, // 状态
  classType: { type: Number, }, // 课类型
  classTime: { type: Number, }, // 课时长
  remark: { type: String, default: '', trim: true }, // 备注
  createUser: { type: Object, default: null }, // 创建者
  modifyUser: { type: Object, default: null }, // 修改者
}, {
  timestamps: true,
})

schema.virtual('date').get(function () {
  return initHour(this.startTime)
})

module.exports = mongoose.model('Course', schema, 'piano_space_course');