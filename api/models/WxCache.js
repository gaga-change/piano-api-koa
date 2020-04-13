// 清单

const mongoose = require('mongoose')
const { Schema } = mongoose


const schema = new Schema({
  type: { type: String },
  token: { type: String },
  log: [
    {
      time: { type: Date },
    },
  ]
}, {
  timestamps: true,
})

module.exports = mongoose.model('wxCache', schema, 'piano_wx_cache');