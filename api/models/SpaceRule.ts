// 清单

import mongoose, {Schema, Document, Model} from 'mongoose'
import {findIdRemovedConfig} from "../tools/aggregateConfig";
import {PersonDocument} from "./Person";
import {PERSON_DB_NAME} from "../config/dbName";
import {initStartTimeAndEndTimeSchema, startTimeAndEndTimeSchema} from "./startTimeAndEndTimeSchema";

export interface SpaceRuleDocument extends  Document {
  setWeek(week: number):SpaceRuleDocument;
  startTime: Date
  endTime: Date
  person?: Schema.Types.ObjectId | PersonDocument | string
  remark?: string
}

const schema = new Schema({
  ...startTimeAndEndTimeSchema,
  person: { type: Schema.Types.ObjectId, ref: 'Person', required: true },
  remark: { type: String, default: '', trim: true }, // 备注
}, {
  timestamps: true,
})

schema.pre('validate', function(this: SpaceRuleDocument,next) {
  initStartTimeAndEndTimeSchema(this.startTime, this.endTime)
  next();
});


schema.method({
  setWeek(week: number) {
    this.startTime = new Date(this.startTime).setFullYear(2019, 6, week)
    this.endTime = new Date(this.endTime).setFullYear(2019, 6, week)
    return this
  },
  crop() {

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
    let idNum = 0;
    let docNum = 0;
    const personIds = await this.aggregate(findIdRemovedConfig('person', PERSON_DB_NAME))
    idNum += personIds.length
    for (let i = 0; i < personIds.length; i++) {
      const id = personIds[i]._id
      const res = await this.deleteMany({person: id})
      docNum += res.deletedCount
    }
    return {
      idNum,
      docNum
    }
  },
  /**
   * 根据真实日期时间范围 查询有交集的空闲规则
   * @param startTime
   * @param endTime
   * @param personKind
   */
  async findByTimeArea(this: Model<SpaceRuleDocument>, startTime: Date, endTime: Date, personKind: string): Promise<Array<SpaceRuleDocument>> {
    startTime = new Date(startTime)
    endTime = new Date(endTime)
    startTime.setFullYear(2019, 6, startTime.getDay() === 0 ? 7 : startTime.getDay())
    endTime.setFullYear(2019, 6, endTime.getDay() === 0 ? 7 : startTime.getDay())
    return this.aggregate([
      {
        $lookup: {
          from: PERSON_DB_NAME,
          localField: 'person',
          foreignField: "_id",
          as: "person"
        }
      },
      {
        $match: {
          'person.kind': personKind,
          $or: [
            {startTime: {$gte: startTime, $lt: endTime}},
            {endTime: {$gt: startTime, $lte: endTime}},
            {startTime: {$lte: startTime}, endTime: {$gte: endTime}}
          ]
        }
      },
      {
        $addFields: {
          person:  {$arrayElemAt: ["$person", 0]} ,
        }
      },
    ])
  }
})

interface SpaceRuleModel extends Model<SpaceRuleDocument>{
  findByWeek(week: number):Promise<Array<SpaceRuleDocument>>
  removeNoTeacherOrStudent():Promise<void>
  findByTimeArea(startTime: Date, endTime: Date, personKind: string): Promise<Array<SpaceRuleDocument>>

}

export default <SpaceRuleModel>mongoose.model<SpaceRuleDocument>('SpaceRule', schema, 'piano_space_rule');