import mongoose, {Document, Schema} from 'mongoose';
import {TeacherDocument} from "./Teacher";
import {StudentDocument} from "./Student";
import {ClassTypeDocument} from "./ClassType";
import {ClassTimeDocument} from "./ClassTime";
import {CourseDocument} from "./Course";
import {OrderDocument} from "./Order";

export interface TakeCourseDocument extends Document {
  startTime: Date
  student: Schema.Types.ObjectId | StudentDocument | string
  teacher?: Schema.Types.ObjectId | TeacherDocument | string
  course?: Schema.Types.ObjectId | CourseDocument | string
  classType: Schema.Types.ObjectId | ClassTypeDocument | string
  classTime: Schema.Types.ObjectId | ClassTimeDocument | string
  order?: Schema.Types.ObjectId | OrderDocument | string
  teacherTypes: Array<Schema.Types.ObjectId>
  cancel: boolean
  remark?: string
}

const schema = new Schema({
  startTime: {type: Date, required: true}, // 开始时间
  teacher: {type: Schema.Types.ObjectId, ref: 'Teacher'},
  student: {type: Schema.Types.ObjectId, ref: 'Student'},
  course: {type: Schema.Types.ObjectId, ref: 'Course'},
  classType: {type: Schema.Types.ObjectId, ref: 'ClassType', required: true}, // 课类型
  classTime: {type: Schema.Types.ObjectId, ref: 'ClassTime', required: true}, // 课时长
  order: {type: Schema.Types.ObjectId, ref: 'Order'}, // 订单
  teacherTypes: [Schema.Types.ObjectId], // 教师类型
  cancel: {type: Boolean, default: false},
  remark: {type: String, default: '', trim: true}, // 备注
}, {
  timestamps: true,
})


export default mongoose.model<TakeCourseDocument>('TakeCourse', schema, 'piano_take_course')