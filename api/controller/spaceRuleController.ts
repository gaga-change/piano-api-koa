import {Context} from "koa";
import SpaceArea from "../models/SpaceArea";
import {accordWithRule, copyHour, getActivityArea} from "../tools/dateTools";
import Controller from "../tools/Controller";
import * as mongoose from "mongoose";
import Course from "../models/Course";
import {NO_SPACE_AREA} from "../config/msg";
import SpaceRule, {SpaceRuleDocument} from "../models/SpaceRule";
import {ClientSession, Model} from "mongoose";
import courseController from "./courseController";

/** 自动新增空闲时间 */
const setSpaceArea = async (spaceRule: SpaceRuleDocument, opt = {}) => {
  const { startTime, endTime, teacher, student } = spaceRule
  const days = accordWithRule(startTime) // 输入星期，返回有效日期列表
  for (let i = 0; i<days.length; i ++) {
    let date = days[i]
    const spaceArea = new SpaceArea({
      teacher,
      student,
      spaceRule,
      startTime: copyHour(date, startTime),
      endTime: copyHour(date, endTime)
    })
    await spaceArea.save(opt)
  }
}

const delSpaceArea = async (id: string, opt:{session?:any} = {}) => {
  await SpaceArea.deleteMany({ spaceRule: id }, opt)
}

class SpaceRuleController extends Controller<SpaceRuleDocument> {
  constructor(model: Model<SpaceRuleDocument>) {
    super(model, { defaultSort: { startTime: 1 } })
  }


  /** 批量修改 */
  async modify(ctx: Context) {
    console.log(ctx.request.body)
    const { del: delIds = [], add: addItems = [] } = ctx.request.body
    if (delIds.length === 0) { // 只有新增的，没有删除
      for (let i in addItems) {
        const item = await SpaceRule.create(addItems[i])
        setSpaceArea(item)
      }
    } else { // 有删除，有新增
      const session: ClientSession = await mongoose.startSession();
      session.startTransaction();
      try {
        for (let i in delIds) { // 先删除
          let id = delIds[i]
          await SpaceRule.deleteOne({ _id: id }, { session })
          await delSpaceArea(id, { session })
        }
        for (let i in addItems) { // 后新增
          const item = await new SpaceRule(addItems[i]).save({ session })
          await setSpaceArea(item, { session })
        }
        // 获取本人失效内所有课程
        {
          const { teacher, student } = addItems[0]
          const params = teacher ? { teacher } : { student }
          const activityArea = getActivityArea()
          const courses = await Course.find({ ...params, startTime: { $gte: activityArea[0], $lt: activityArea[1] } }, undefined, { session })
          for (let i = 0; i<courses.length; i ++) {
            let course = courses[i]
            await courseController.updateSpaceArea(course, !!teacher, session )
          }
        }
        await session.commitTransaction()
        session.endSession()
      } catch (error) {
        await session.abortTransaction();
        session.endSession()
        if (error.message === NO_SPACE_AREA) {
          error.message = '有课程不再此时间规则内，请修改当前规则后再试'
        }
        error.status = 400
        error.expose = true
        throw error
      }

    }
    ctx.body = ctx.request.body
  }

  async create(ctx: Context) {
    let item = ctx.request.body;

    item = new this.Model(item);
    ctx.body = await item.save()
    setImmediate(() => {
      setSpaceArea(item)
    })
  }

  async destroy(ctx: Context) {
    const { id } = ctx.params;

    await this.Model.deleteOne({ _id: id })
    setImmediate(() => {
      delSpaceArea(id)
    })
    ctx.body = null
  }
}

export default new SpaceRuleController(SpaceRule)