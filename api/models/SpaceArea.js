// 清单

const mongoose = require('mongoose')
const { initHour } = require('../tools/dateTools')
const { Schema } = mongoose


const schema = new Schema({
  startTime: { type: Date, }, // 开始时间
  endTime: { type: Date }, // 结束时间，
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  spaceRule: { type: Schema.Types.ObjectId, ref: 'SpaceRule' },
  remark: { type: String, default: '', trim: true }, // 备注
  createUser: { type: Object, default: null }, // 创建者
  modifyUser: { type: Object, default: null }, // 修改者
}, {
  timestamps: true,
})

schema.virtual('date').get(function () {
  return initHour(this.startTime)
})

module.exports = mongoose.model('SpaceArea', schema, 'piano_space_area');