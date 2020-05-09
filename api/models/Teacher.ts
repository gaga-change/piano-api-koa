// 清单

import mongoose, {Document , Schema} from 'mongoose';
import {TEACHER_DB_NAME} from "../config/dbName";


export interface TeacherDocument extends Document {
  name: string
  school?: string
  major?: string
  grade?: number
  type?: number
  status: number
  phone: string
  openid?: string
  wx?: any
  remark?: string
}

const schema = new Schema({
  name: { type: String, default: '', trim: true }, // 名称
  school: { type: String, trim: true }, // 学校
  major : { type: String, trim: true }, // 专业
  grade : { type: Number,  }, // 等级
  type : { type: Number,  }, // 类型
  status : { type: Number, default: 0  }, // 状态
  phone: {type: String,}, // 手机号码
  openid: {type: String, }, // wx openId
  wx: {type: Schema.Types.Mixed,  }, // 微信用户信息
  remark: { type: String, trim: true }, // 备注
}, {
  timestamps: true,
})

export default mongoose.model<TeacherDocument>('Teacher', schema, TEACHER_DB_NAME)