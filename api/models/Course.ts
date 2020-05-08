// 清单

import mongoose , {Schema, Document}from 'mongoose'
import {initHour} from "../tools/dateTools";
import {TeacherDocument} from "./Teacher";
import {StudentDocument} from "./Student";
import {SpaceRuleDocument} from "./SpaceRule";

export interface CourseDocument extends Document{
  startTime: Date
  endTime: Date
  teacher: Schema.Types.ObjectId | TeacherDocument | string
  student: Schema.Types.ObjectId | StudentDocument| string
  teacherSpaceRule: Schema.Types.ObjectId | SpaceRuleDocument| string
  studentSpaceRule: Schema.Types.ObjectId | SpaceRuleDocument| string
  teacherTag?: number
  studentTag?: number
  status: number
  classType?: number
  classTime?: number
  remark?: string
}

const schema = new Schema({
  startTime: { type: Date, }, // 开始时间
  endTime: { type: Date }, // 结束时间，
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  teacherSpaceRule: { type: Schema.Types.ObjectId, ref: 'SpaceRule' },
  studentSpaceRule: { type: Schema.Types.ObjectId, ref: 'SpaceRule' },
  teacherTag: { type: Number }, // 老师标签
  studentTag: { type: Number }, // 学生标签
  status: { type: Number, default: 0}, // 状态
  classType: { type: Number, }, // 课类型
  classTime: { type: Number, }, // 课时长
  remark: { type: String, default: '', trim: true }, // 备注
}, {
  timestamps: true,
})

schema.virtual('date').get(function (this:CourseDocument ) {
  return initHour(this.startTime)
})

export default mongoose.model<CourseDocument>('Course', schema, 'piano_space_course');