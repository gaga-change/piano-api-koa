// 清单

import mongoose, {Schema, Document} from 'mongoose';
import {SchemaTimestampsDocument} from "../type/other";

interface log {
  time: Date
}

 export interface WxCacheTokenDocument extends  Document, SchemaTimestampsDocument{
  type: string
  token: string
  log: Array<log>
}

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

export  default  mongoose.model<WxCacheTokenDocument>('WxCacheToken', schema, 'piano_wx_cache_token');