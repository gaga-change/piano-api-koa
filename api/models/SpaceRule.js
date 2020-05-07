// 清单

const mongoose = require('mongoose')
const { Schema } = mongoose


const schema = new Schema({
  startTime: { type: Date, }, // 开始时间
  endTime: { type: Date }, // 结束时间，
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  // week: { type: Number },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  remark: { type: String, default: '', trim: true }, // 备注
  createUser: { type: Object, default: null }, // 创建者
  modifyUser: { type: Object, default: null }, // 修改者
}, {
  timestamps: true,
})

schema.method({
  setWeek(week) {
    this.startTime = new Date(this.startTime).setFullYear(2019, 6, week)
    this.endTime = new Date(this.endTime).setFullYear(2019, 6, week)
  }
})

module.exports = mongoose.model('SpaceRule', schema, 'piano_space_rule');