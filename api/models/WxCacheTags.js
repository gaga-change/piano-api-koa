// 清单

const mongoose = require('mongoose')
const { Schema } = mongoose


const schema = new Schema({
  type: { type: String },
  tags: [{
    id: { type: Number },
    name: { type: String },
    count: { type: Number }
  }],
  log: [
    {
      time: { type: Date },
    },
  ]
}, {
  timestamps: true,
})

module.exports = mongoose.model('WxCacheTags', schema, 'piano_wx_cache_tags');