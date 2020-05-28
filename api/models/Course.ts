// 清单

import mongoose, {Schema, Document, Model} from 'mongoose'
import {initHour} from "../tools/dateTools";
import {TeacherDocument} from "./Teacher";
import {StudentDocument} from "./Student";
import {SpaceRuleDocument} from "./SpaceRule";
import {findByActivateArea, FindByActivateAreaOptions} from "../tools/aggregateConfig";
import {initStartTimeAndEndTimeSchema, startTimeAndEndTimeSchema} from "./startTimeAndEndTimeSchema";
import {COURSE_STATUS_MAP} from "../config/enums";

export interface CourseDocument extends Document {
  startTime: Date
  endTime: Date
  teacher?: Schema.Types.ObjectId | TeacherDocument | string
  student?: Schema.Types.ObjectId | StudentDocument | string
  teacherSpaceRule?: Schema.Types.ObjectId | SpaceRuleDocument | string
  studentSpaceRule?: Schema.Types.ObjectId | SpaceRuleDocument | string
  teacherTag?: number
  studentTag?: number
  status: number
  classType?: number
  classTime?: number
  remark?: string
}

const schema = new Schema({
  ...startTimeAndEndTimeSchema,
  teacher: {type: Schema.Types.ObjectId, ref: 'Teacher'},
  student: {type: Schema.Types.ObjectId, ref: 'Student'},
  teacherTag: {type: Number}, // 老师标签
  studentTag: {type: Number}, // 学生标签
  status: {type: Number, default: 0, enum: [...COURSE_STATUS_MAP.keys()]}, // 状态
  classType: {type: Number, required: [true, '课类型必填']}, // 课类型
  classTime: {
    type: Number, required: [true, '课时长必填'], validate: {
      validator: function (val: number) {
        if (!this.endTime || !this.startTime) return true
        return this.endTime && this.startTime && (this.endTime.getTime() - this.startTime.getTime()) === val * 60 * 1000
      },
      message: "课时长和开始时间、结束时间不对应"
    }
  }, // 课时长
  remark: {type: String, default: '', trim: true}, // 备注
}, {
  timestamps: true,
})

schema.pre('validate', function(this: CourseDocument,next) {
  initStartTimeAndEndTimeSchema(this.startTime, this.endTime)
  next();
});

schema.virtual('date').get(function (this: CourseDocument) {
  return initHour(this.startTime)
})


schema.static({
  /**
   * 获取有效范围内的 所有课程
   * @param options
   */
  async findByActivateArea(this: Model<CourseDocument>, options: FindByActivateAreaOptions) {
    return findByActivateArea(this, options)
  },
  /**
   * 给定时间范围，查询有时间重叠的课程
   * @param startTime
   * @param endTime
   * @param teacher
   * @param student
   */
  async findByTimeArea(this: Model<CourseDocument>, startTime: Date | string | number, endTime: Date | string | number, teacher?: string, student?: string) {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    const params: { $or: any, teacher?: string, student?: string } = {
      $or: [
        {startTime: {$gte: startTime, $lte: endTime}},
        {endTime: {$gte: startTime, $lte: endTime}},
        {startTime: {$lte: startTime}, endTime: {$gte: endTime}}
      ]
    }
    if (teacher) {
      params.teacher = teacher
    }
    if (student) {
      params.student = student
    }
    return this.find(params)
  }
})

interface CourseModel extends Model<CourseDocument> {
  findByActivateArea(options: FindByActivateAreaOptions): Promise<Array<CourseDocument>>

  findByTimeArea(startTime: Date | string | number, endTime: Date | string | number, teacher?: string, student?: string): Promise<Array<CourseDocument>>
}

export default <CourseModel>mongoose.model<CourseDocument>('Course', schema, 'piano_space_course');