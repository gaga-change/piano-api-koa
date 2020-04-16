// 清单

const mongoose = require('mongoose')
const { Schema } = mongoose

const KeyValueSchema = new Schema({
  name: { type: String, default: '', trim: true },
  value: { type: Number },
});

const schema = new Schema({
  name: { type: String, default: '', trim: true }, // 名称
  keyValue: { type: [KeyValueSchema], default: [] }, // 键值对
  remark: { type: String, default: '', trim: true }, // 备注
  createUser: { type: Object, default: null }, // 创建者
  modifyUser: { type: Object, default: null }, // 修改者
}, {
  timestamps: true,
})

module.exports = mongoose.model('Enum', schema, 'piano_enum');