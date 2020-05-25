// 清单

import mongoose, {Schema, Document} from 'mongoose'

export interface ShareDocument extends Document {
  shareOpenid: string
  subscribeOpenid: string
}

const schema = new Schema({
  shareOpenid: {type: String, required: true}, // 分享者
  subscribeOpenid: {type: String, required: true}, // 关注者
}, {
  timestamps: true,
})

export default mongoose.model<ShareDocument>('Share', schema, 'piano_share');