// 课程

import mongoose, {Schema, Document} from 'mongoose'
import ClassTime, {ClassTimeDocument} from "./ClassTime";
import {TeacherTypeDocument} from "./TeacherType";

export interface BonusRuleDocument extends Document {
  teacherType: Schema.Types.ObjectId | TeacherTypeDocument | string
  classTime: Schema.Types.ObjectId | ClassTimeDocument | string
  price: number,
  disabled: boolean,
  remark: string,
}

const schema = new Schema({
  teacherType: {type: Schema.Types.ObjectId, ref: 'TeacherType', required: true},
  classTime: {type: Schema.Types.ObjectId, ref: 'ClassTime', required: true},
  price: {type: Number, default: 0},
  remark: {type: String, default: '', trim: true}, // 备注
  disabled: {type: Boolean, default: false }, // 是否禁用
}, {
  timestamps: true,
})


export default mongoose.model<BonusRuleDocument>('BonusRule', schema, 'piano_bonus_rules');