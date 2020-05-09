// 清单

import mongoose, {Schema, Document, Model} from 'mongoose'
import {initHour} from '../tools/dateTools'
import {TeacherDocument} from "./Teacher";
import {StudentDocument} from "./Student";
import {SpaceRuleDocument} from "./SpaceRule";
import {findByActivateArea, FindByActivateAreaOptions, removeNoTeacherOrStudent} from "../tools/aggregateConfig";
import {CourseDocument} from "./Course";

export  interface SpaceAreaDocument extends  Document{
  startTime: Date
  endTime: Date
  teacher?: Schema.Types.ObjectId | TeacherDocument | string
  student?: Schema.Types.ObjectId | StudentDocument | string
  remark?: string
  spaceRule: Schema.Types.ObjectId | SpaceRuleDocument | string
}


const schema = new Schema({
  startTime: { type: Date, }, // 开始时间
  endTime: { type: Date }, // 结束时间，
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  spaceRule: { type: Schema.Types.ObjectId, ref: 'SpaceRule' },
  remark: { type: String, default: '', trim: true }, // 备注
}, {
  timestamps: true,
})

schema.virtual('date').get(function (this: SpaceAreaDocument) {
  return initHour(this.startTime)
})

schema.static({
  /**
   * 删除老师或学生已被删除的数据
   */
  async removeNoTeacherOrStudent(this: Model<SpaceAreaDocument>): Promise<{ idNum: number, docNum: number }> {
    return await removeNoTeacherOrStudent(this)
  },
  /**
   * 获取有效范围内的 空闲时间
   * @param options
   */
  async findByActivateArea(this: Model<SpaceAreaDocument>, options: FindByActivateAreaOptions) {
    return findByActivateArea(this, options)
  }
})

interface SpaceAreaModel extends Model<SpaceAreaDocument>{
  removeNoTeacherOrStudent():Promise<void>
  findByActivateArea(options: FindByActivateAreaOptions): Promise<Array<CourseDocument>>
}

export default <SpaceAreaModel>mongoose.model<SpaceAreaDocument>('SpaceArea', schema, 'piano_space_area');