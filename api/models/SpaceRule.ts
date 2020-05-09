// 清单

import mongoose, {Schema, Document, Model} from 'mongoose'
import {TeacherDocument} from "./Teacher";
import {StudentDocument} from "./Student";
import {removeNoTeacherOrStudent} from "../tools/aggregateConfig";

export interface SpaceRuleDocument extends  Document {
  setWeek(week: number):SpaceRuleDocument;
  startTime: Date
  endTime: Date
  teacher?: Schema.Types.ObjectId | TeacherDocument | string
  student?: Schema.Types.ObjectId | StudentDocument | string
  remark?: string
}

const schema = new Schema({
  startTime: { type: Date, }, // 开始时间
  endTime: { type: Date }, // 结束时间，
  teacher: { type: Schema.Types.ObjectId, ref: 'Teacher' },
  student: { type: Schema.Types.ObjectId, ref: 'Student' },
  remark: { type: String, default: '', trim: true }, // 备注
}, {
  timestamps: true,
})

schema.method({
  setWeek(week: number) {
    this.startTime = new Date(this.startTime).setFullYear(2019, 6, week)
    this.endTime = new Date(this.endTime).setFullYear(2019, 6, week)
    return this
  }
})

schema.static({
  /** 根据周查找 */
  findByWeek(this: Model<SpaceRuleDocument>,week: number) {
    const startTime = new Date()
    startTime.setFullYear(2019, 6, week)
    startTime.setHours(0, 0, 0, 0)
    const endTime = new Date()
    endTime.setFullYear(2019, 6, week + 1)
    endTime.setHours(0, 0, 0, 0)
    return this.find({startTime: {$gte: startTime, $lt: endTime}})
  },
  /**
   * 删除老师或学生已被删除的数据
   */
  async removeNoTeacherOrStudent(this: Model<SpaceRuleDocument>): Promise<{ idNum: number, docNum: number }> {
    return await removeNoTeacherOrStudent(this)
  }
})

interface SpaceRuleModel extends Model<SpaceRuleDocument>{
  findByWeek(week: number):Promise<Array<SpaceRuleDocument>>
  removeNoTeacherOrStudent():Promise<void>
}

export default <SpaceRuleModel>mongoose.model<SpaceRuleDocument>('SpaceRule', schema, 'piano_space_rule');