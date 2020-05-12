import {Context} from "koa";
import SpaceArea from "../models/SpaceArea";
import {accordWithRule, copyHour, getActivityArea} from "../tools/dateTools";
import Controller from "../tools/Controller";
import Course from "../models/Course";
import SpaceRule, {SpaceRuleDocument} from "../models/SpaceRule";
import {Model} from "mongoose";

/** 自动新增空闲时间 */
const setSpaceArea = async (spaceRule: SpaceRuleDocument, opt = {}) => {
  const {startTime, endTime, teacher, student} = spaceRule
  const days = accordWithRule(startTime) // 输入星期，返回有效日期列表
  for (let i = 0; i < days.length; i++) {
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

const delSpaceArea = async (id: string, opt: { session?: any } = {}) => {
  await SpaceArea.deleteMany({spaceRule: id}, opt)
}

class SpaceRuleController extends Controller<SpaceRuleDocument> {
  constructor(model: Model<SpaceRuleDocument>) {
    super(model, {defaultSort: {startTime: 1}})
  }


  /**
   * 清理 主文档被删除的文档
   * @param ctx
   */
  async clearDiscardDoc(ctx: Context) {
    ctx.body = await SpaceRule.removeNoTeacherOrStudent()
  }

  /** 批量修改 */
  async modify(ctx: Context) {
    const {session} = ctx.state
    ctx.assert(session, 500, 'no session')
    const {del: delIds = [], add: addItems = []} = ctx.request.body
    if (delIds.length === 0) { // 只有新增的，没有删除
      for (let i in addItems) {
        const item = await SpaceRule.create(addItems[i], {session})
        await setSpaceArea(item, {session})
      }
    } else { // 有删除，有新增
      for (let i in delIds) { // 先删除
        let id = delIds[i]
        await SpaceRule.deleteOne({_id: id}, {session})
        await delSpaceArea(id, {session})
      }
      for (let i in addItems) { // 后新增
        const item = await new SpaceRule(addItems[i]).save({session})
        await setSpaceArea(item, {session})
      }
      // 获取本人 生效的&被删除空闲规则的 课程
      {
        const {teacher, student} = addItems[0]
        const params = teacher ? {teacher, teacherSpaceRule: {$in: delIds}} : {
          student,
          studentSpaceRule: {$in: delIds}
        }
        const activityArea = getActivityArea()
        const courses = await Course.find({
          ...params,
          startTime: {$gte: activityArea[0], $lt: activityArea[1]},
        }, undefined, {session})
        for (let i = 0; i < courses.length; i++) {
          let course = courses[i]
          const {startTime, endTime} = course
          const person = teacher ? {teacher} : {student}
          const spaceRule = await SpaceArea.cropArea({
            ...person,
            startTime,
            endTime,
            session
          })
          if (teacher) {
            course.teacherSpaceRule = spaceRule
          } else {
            course.studentSpaceRule = spaceRule
          }
          await course.save({session}) // 有修改对应绑定的规则，需要重新保存
        }
      }
    }
    ctx.body = ctx.request.body
  }

  async create(ctx: Context) {
    let item = ctx.request.body;

    item = new this.Model(item);
    ctx.body = await item.save()
    setImmediate(async () => {
      await setSpaceArea(item)
    })
  }

  async destroy(ctx: Context) {
    const {id} = ctx.params;

    await this.Model.deleteOne({_id: id})
    setImmediate(async () => {
      await delSpaceArea(id)
    })
    ctx.body = null
  }
}

export default new SpaceRuleController(SpaceRule)