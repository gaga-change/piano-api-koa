// 课程

import mongoose, {Schema, Document, Model} from 'mongoose'
import {initHour} from "../tools/dateTools";
import {TeacherDocument} from "./Teacher";
import {StudentDocument} from "./Student";
import {findByActivateArea, FindByActivateAreaOptions} from "../tools/aggregateConfig";
import {initStartTimeAndEndTimeSchema, startTimeAndEndTimeSchema} from "./startTimeAndEndTimeSchema";
import {COURSE_PERSON_STATUS_MAP, COURSE_STATUS_MAP} from "../config/enums";
import ClassTime, {ClassTimeDocument} from "./ClassTime";
import {ClassTypeDocument} from "./ClassType";
import {OrderDocument} from "./Order";

export interface CourseDocument extends Document {
  startTime: Date
  endTime: Date
  teacher?: Schema.Types.ObjectId | TeacherDocument | string
  student?: Schema.Types.ObjectId | StudentDocument | string
  teacherStatus: number
  studentStatus: number
  status: number
  classType: Schema.Types.ObjectId | ClassTypeDocument | string
  classTime: Schema.Types.ObjectId | ClassTimeDocument | string
  order?: Schema.Types.ObjectId | OrderDocument | string
  remark?: string
}

const schema = new Schema({
  ...startTimeAndEndTimeSchema,
  teacher: {type: Schema.Types.ObjectId, ref: 'Teacher'},
  student: {type: Schema.Types.ObjectId, ref: 'Student'},
  teacherStatus: {type: Number, default: 0, enum: [...COURSE_PERSON_STATUS_MAP.keys()]}, // 老师状态
  studentStatus: {type: Number, default: 0, enum: [...COURSE_PERSON_STATUS_MAP.keys()]}, // 学生状态
  status: {type: Number, default: 0, enum: [...COURSE_STATUS_MAP.keys()]}, // 状态
  classType: {type: Schema.Types.ObjectId, ref: 'ClassType', required: true}, // 课类型
  classTime: {type: Schema.Types.ObjectId, ref: 'ClassTime', required: true}, // 课时长
  order: {type: Schema.Types.ObjectId, ref: 'Order'}, // 订单
  remark: {type: String, default: '', trim: true}, // 备注
}, {
  timestamps: true,
})

schema.pre('validate', function (this: CourseDocument, next) {
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
   * @param appendQuery
   */
  async findByActivateArea(this: Model<CourseDocument>, options: FindByActivateAreaOptions, appendQuery: any = {}) {
    return findByActivateArea(this, options, appendQuery)
  },
  /**
   * 给定时间范围，查询有时间重叠的课程
   * @param startTime
   * @param endTime
   * @param teacher
   * @param student
   * @param appendQuery
   */
  async findByTimeArea(this: Model<CourseDocument>, startTime: Date | string | number, endTime: Date | string | number, teacher?: string, student?: string, appendQuery: any = {}) {
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
    return this.find({...params, ...appendQuery})
  },
  /**
   * 校验 开始时间和结束时间 与 课时 是否对应
   * @param startTime
   * @param endTime
   * @param classTime
   */
  async checkTimeArea(this: Model<CourseDocument>, startTime: Date | string | number, endTime: Date | string | number, classTime: any): Promise<boolean> {
    const ct = await ClassTime.findById(classTime)
    if (!ct) {
      return false
    } else {
      let st = new Date(startTime)
      let et = new Date(endTime)
      st.setSeconds(0, 0)
      et.setSeconds(0, 0)
      return (et.getTime() - st.getTime() > 0) && (((et.getTime() - st.getTime()) / 1000 / 60 === ct.time))
    }
  }
})

interface CourseModel extends Model<CourseDocument> {
  findByActivateArea(options: FindByActivateAreaOptions, appendQuery?: any): Promise<Array<CourseDocument>>

  findByTimeArea(startTime: Date | string | number, endTime: Date | string | number, teacher?: string, student?: string, appendQuery?: any): Promise<Array<CourseDocument>>

  checkTimeArea(startTime: Date | string | number, endTime: Date | string | number, classTime: any): Promise<boolean>
}

export default <CourseModel>mongoose.model<CourseDocument>('Course', schema, 'piano_space_course');