
const SpaceArea = require('./models/SpaceArea')
const SpaceRule = require('./models/SpaceRule')
const Controller = require('./Controller')
const { validDays, initHour, ONE_DAY_TIME, copyHour } = require('./tools')

class SpaceAreaController extends Controller {
  constructor(model) {
    super(model, { defaultSort: { date: -1 } })
  }

  /** 自动创建空闲时间，返回创建数量 */
  async autoCreateService() {
    let createNum = 0
    // await SpaceArea.deleteMany({})
    const temp = await SpaceArea.findOne({}).sort({ date: -1 })
    // 获取开始自动生成空闲时间的日期
    const days = validDays(temp ? (temp.date.getTime() + ONE_DAY_TIME) : new Date())
    for (let i in days) {
      let date = days[i]
      let week = date.getDay() === 0 ? 7 : date.getDay() // 获取星期
      const spaceRules = await SpaceRule.find({ week }) // 获取当天规则，含量大问题，量大需要后期分批处理
      for (let j in spaceRules) { // 循环规则，创建空闲时间
        let spaceRule = spaceRules[j]
        const { startTime, endTime, teacher, student } = spaceRule
        let spaceArea = new SpaceArea({ startTime: copyHour(date, startTime), endTime: copyHour(date, endTime), teacher, student, spaceRule, date })
        await spaceArea.save()
        createNum++
      }
    }
    // 清除失效的空闲时间
    await SpaceArea.deleteMany({ date: { $lt: initHour(new Date()) } })
    return createNum
  }

  /** 自动生成空闲时间 */
  async autoCreate(ctx) {
    ctx.body = {
      createNum: await this.autoCreateService()
    }
  }

  async index(ctx) {
    const query = ctx.query;
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const params = { ...query }
    if (params.hasTeacher) {
      params.teacher = { $exists: true }
      delete params.hasTeacher
    }
    if (params.hasStudent) {
      params.student = { $exists: true }
      delete params.hasStudent
    }
    if (params.startTime && params.endTime) {
      let { startTime, endTime } = params
      startTime = new Date(startTime)
      endTime = new Date(endTime)
      delete params.startTime
      delete params.endTime
      params.$or = [
        { startTime: { $gte: startTime, $lt: endTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    }
    delete params.pageSize
    delete params.pageNum
    Object.keys(params).forEach(key => {
      if (this.Model.schema.obj[key] && this.Model.schema.obj[key].type === String) {
        params[key] = new RegExp(params[key], 'i')
      }
    })
    const res1 = SpaceArea.find(params)
      .sort(this.defaultSort)
      .limit(pageSize)
      .populate({ path: 'teacher', select: 'name' })
      .populate({ path: 'student', select: 'name' })
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }
}

module.exports = new SpaceAreaController(SpaceArea)