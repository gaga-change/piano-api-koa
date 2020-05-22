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
  }
})

interface SpaceRuleModel extends Model<SpaceRuleDocument>{
  findByWeek(week: number):Promise<Array<SpaceRuleDocument>>
  removeNoTeacherOrStudent():Promise<void>
}

export default <SpaceRuleModel>mongoose.model<SpaceRuleDocument>('SpaceRule', schema, 'piano_space_rule');