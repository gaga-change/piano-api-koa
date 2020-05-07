
const SpaceRule = require('./models/SpaceRule')
const Controller = require('./Controller')
const SpaceArea = require('./models/SpaceArea')

const { accordWithRule, copyHour } = require('./tools')

/** 自动新增空闲时间 */
const setSpaceArea = async spaceRule => {
  const { startTime, endTime, teacher, student } = spaceRule
  const days = accordWithRule(startTime) // 输入星期，返回有效日期列表
  for (let i in days) {
    let date = days[i]
    const spaceArea = new SpaceArea({
      teacher,
      student,
      spaceRule,
      date,
      startTime: copyHour(date, startTime),
      endTime: copyHour(date, endTime)
    })
    await spaceArea.save()
  }
}

const delSpaceArea = async id => {
  await SpaceArea.deleteMany({ spaceRule: id })
}

class SpaceRuleController extends Controller {
  constructor(model) {
    super(model, { defaultSort: { startTime: 1 } })
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