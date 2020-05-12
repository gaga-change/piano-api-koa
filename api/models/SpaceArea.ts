// 清单

import mongoose, {Schema, Document, Model, ClientSession} from 'mongoose'
import {initHour} from '../tools/dateTools'
import {TeacherDocument} from "./Teacher";
import {StudentDocument} from "./Student";
import SpaceRule, {SpaceRuleDocument} from "./SpaceRule";
import {findByActivateArea, FindByActivateAreaOptions, removeNoTeacherOrStudent} from "../tools/aggregateConfig";
import {CourseDocument} from "./Course";
import ThrowError from "../tools/ThrowError";
import {NO_SPACE_AREA} from "../config/msg";

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
interface CropAreaOptions {
  startTime: Date | string
  endTime: Date | string
  teacher?: string
  student?: string
  session?: ClientSession
}
interface JoinAreaOptions {
  startTime: Date | string
  endTime: Date | string
  teacher?: Schema.Types.ObjectId | TeacherDocument | string
  student?: Schema.Types.ObjectId | StudentDocument | string
  spaceRule?: Schema.Types.ObjectId | SpaceRuleDocument | string
  session?: ClientSession
}
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
  },
  /**
   * 裁剪空闲时间，裁剪为俩段(或一段 或零段)
   * @param options
   */
  async cropArea(this: Model<SpaceAreaDocument>, options: CropAreaOptions) {
    let spaceRule: SpaceRuleDocument = null
    let {startTime, endTime, teacher, student, session } = options
    if (!teacher && !student) throw new ThrowError("参数异常，没有学生或老师")
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    const person = teacher ? {teacher} : {student}
    const params = { startTime: { $lte: startTime }, endTime: { $gte: endTime }, ...person}
    const targetSpaceArea = await this.findOne(params, undefined, {session}).populate('spaceRule') // 裁剪对象
    if (!targetSpaceArea) throw new ThrowError(NO_SPACE_AREA)
    if (!targetSpaceArea.spaceRule) throw new ThrowError('空闲规则已被删除')
    spaceRule = <SpaceRuleDocument>targetSpaceArea.spaceRule
    {
      let newSpaceArea = new this({ ...targetSpaceArea.toObject(), _id: undefined })
      newSpaceArea.endTime = new Date(startTime.getTime() - 60 * 1000)
      if (newSpaceArea.endTime >= newSpaceArea.startTime) {
        await newSpaceArea.save({session})
      }
    }
    {
      let newSpaceArea = new this({ ...targetSpaceArea.toObject(), _id: undefined })
      newSpaceArea.startTime = new Date(endTime.getTime() + 60 * 1000)
      if (newSpaceArea.endTime >= newSpaceArea.startTime) {
        await newSpaceArea.save({session})
      }
    }
    await this.deleteOne({_id: targetSpaceArea.id}, {session})
    return spaceRule
  },
  /**
   * 合并空闲时间
   * @param options
   */
  async joinArea(this: Model<SpaceAreaDocument>, options : JoinAreaOptions) {
    let {startTime, endTime, teacher, student, spaceRule, session } = options
    if (!teacher && !student) throw new ThrowError("参数异常，没有学生或老师")
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    const person = teacher ? {teacher} : {student}
    const startSpace = await this.findOne({
      ...person,
      endTime: new Date(startTime.getTime() - 60 * 1000),
    }, undefined, {session})
    const endSpace = await this.findOne({
      ...person,
      startTime: new Date(endTime.getTime() + 60 * 1000),
    }, undefined, {session})
    let time = [startTime, endTime]
    if (startSpace) {
      time[0] = startSpace.startTime
      await this.deleteOne({ _id: startSpace.id }, {session})
    }
    if (endSpace) {
      time[1] = endSpace.endTime
      await this.deleteOne({ _id: endSpace.id }, {session})
    }
    const spaceArea = new this({ ...person,spaceRule, startTime: time[0], endTime: time[1] })
    await spaceArea.save({session})
  }

})

interface SpaceAreaModel extends Model<SpaceAreaDocument>{
  removeNoTeacherOrStudent():Promise<void>
  findByActivateArea(options: FindByActivateAreaOptions): Promise<Array<CourseDocument>>
  cropArea( options: CropAreaOptions): Promise<SpaceRuleDocument>
  joinArea( options: JoinAreaOptions): Promise<void>
}

export default <SpaceAreaModel>mongoose.model<SpaceAreaDocument>('SpaceArea', schema, 'piano_space_area');