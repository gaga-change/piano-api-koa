// 清单

import mongoose, {Document, Schema} from 'mongoose';
import {STUDENT_DB_NAME} from "../config/dbName";

export interface StudentDocument extends Document{
  name: string,
  status: number
  phone: string
  openid?: string
  wx?:any
  remark?: string
}

const schema = new Schema({
  name: { type: String, default: '', trim: true }, // 名称
  status: { type: Number, }, // 状态
  phone: { type: String, }, // 手机号码
  openid: { type: String, }, // wx openId
  wx: { type: Schema.Types.Mixed, }, // 微信用户信息
  remark: { type: String, default: '', trim: true }, // 备注
}, {
  timestamps: true,
})

export default mongoose.model<StudentDocument>('Student', schema, STUDENT_DB_NAME);