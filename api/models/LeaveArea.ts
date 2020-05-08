// 清单

import mongoose, {Schema, Document} from 'mongoose';
import {CourseDocument} from "./Course";
import {TeacherDocument} from "./Teacher";
import {StudentDocument} from "./Student";

export interface LeaveAreaDocument extends Document{
  course: Schema.Types.ObjectId | CourseDocument | string
  teacher?: Schema.Types.ObjectId | TeacherDocument | string
  student?: Schema.Types.ObjectId | StudentDocument | string
  status: number
  remark: string
}

const schema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course' },
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  status: { type: Number, }, // 状态
  remark: { type: String, default: '', trim: true }, // 备注
}, {
  timestamps: true,
})

export default mongoose.model<LeaveAreaDocument>('LeaveArea', schema, 'piano_leave_area');