// 请假单

import mongoose, {Schema, Document} from 'mongoose';
import {CourseDocument} from "./Course";
import {TeacherDocument} from "./Teacher";
import {LEAVE_AREA_STATUS_READY} from "../config/const";
import {LEAVE_AREA_STATUS_MAP} from "../config/enums";

export interface LeaveAreaDocument extends Document{
  course: Schema.Types.ObjectId | CourseDocument | string
  person: Schema.Types.ObjectId | TeacherDocument | string
  status: number
  remark: string
}

const schema = new Schema({
  course: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
  person: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
  status: { type: Number, default: LEAVE_AREA_STATUS_READY, enum: [...LEAVE_AREA_STATUS_MAP.keys()]}, // 状态
  remark: { type: String, default: '', trim: true }, // 备注
}, {
  timestamps: true,
})

export default mongoose.model<LeaveAreaDocument>('LeaveArea', schema, 'piano_leave_area');