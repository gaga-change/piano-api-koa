import mongoose, {Document, Schema} from 'mongoose';
import {PERSON_DB_NAME} from "../config/dbName";

export interface PersonDocument extends Document {
  name: string
  status: number
  phone: string
  openid?: string
  remark?: string
}

const schema = new Schema({
  name: {type: String, default: '', trim: true}, // 名称
  status: {type: Number, default: 0}, // 状态
  phone: {type: String,}, // 手机号码
  openid: {type: String,}, // wx openId
  remark: {type: String, default: '', trim: true}, // 备注
}, {
  timestamps: true,
  discriminatorKey: 'kind'
})

export default mongoose.model<PersonDocument>('Person', schema, PERSON_DB_NAME)