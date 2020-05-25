// 清单

import mongoose, {Schema, Document} from 'mongoose'
import {SHARE_TYPE_MAP} from "../config/enums";

export interface ShareDocument extends Document {
  shareOpenid: string
  subscribeOpenid: string
  type: number
}

const schema = new Schema({
  shareOpenid: {type: String, required: true}, // 分享者
  subscribeOpenid: {type: String, required: true}, // 关注者
  type:  {type: Number, default: 0, enum: [...SHARE_TYPE_MAP.keys()]},
}, {
  timestamps: true,
})

export default mongoose.model<ShareDocument>('Share', schema, 'piano_share');