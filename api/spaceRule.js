
const SpaceRule = require('./models/SpaceRule')
const Course = require('./models/Course')
const Controller = require('./Controller')
const SpaceArea = require('./models/SpaceArea')
const mongoose = require('mongoose')

const courseController = require('./course')
const { accordWithRule, copyHour, getActivityArea } = require('./tools/dateTools')
const { NO_SPACE_AREA } = require('./msg')

/** 自动新增空闲时间 */
const setSpaceArea = async (spaceRule, opt = {}) => {
  const { startTime, endTime, teacher, student } = spaceRule
  const days = accordWithRule(startTime) // 输入星期，返回有效日期列表
  for (let i in days) {
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

const delSpaceArea = async (id, opt = {}) => {
  await SpaceArea.deleteMany({ spaceRule: id }, opt)
}

class SpaceRuleController extends Controller {
  constructor(model) {
    super(model, { defaultSort: { startTime: 1 } })
  }


  /** 批量修改 */
  async modify(ctx) {
    console.log(ctx.request.body)
    const { del: delIds = [], add: addItems = [] } = ctx.request.body
    if (delIds.length === 0) { // 只有新增的，没有删除
      for (let i in addItems) {
        const item = await SpaceRule.create(addItems[i])
        setSpaceArea(item)
      }
    } else { // 有删除，有新增
      const session = await mongoose.startSession();
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
          for (let i in courses) {
            let course = courses[i]
            await courseController.updateSpaceArea({ ...course.toObject(), teacher, student }, { session })
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

  // 临时代码，数据库升级，舍弃周字段
  async updateDB(ctx) {
    let spaceRules = await SpaceRule.find({})
    for (let i in spaceRules) {
      let item = spaceRules[i]
      let { week } = item.toObject()
      if (week) {
        item.setWeek(week)
        item.week = undefined
      }
      await item.save()
    }
    ctx.body = await SpaceRule.find({})
  }

  async create(ctx) {
    let item = ctx.request.body;

    item = new this.Model(item);
    ctx.body = await item.save()
    setSpaceArea(item)
  }

  async destroy(ctx) {
    const { id } = ctx.params;

    await this.Model.deleteOne({ _id: id })
    delSpaceArea(id)
    ctx.body = null
  }
}

module.exports = new SpaceRuleController(SpaceRule)