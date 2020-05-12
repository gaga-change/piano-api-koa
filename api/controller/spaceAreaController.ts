import Controller from "../tools/Controller";
import SpaceArea, {SpaceAreaDocument} from "../models/SpaceArea";
import {copyHour, initHour, ONE_DAY_TIME, validDays} from "../tools/dateTools";
import SpaceRule from "../models/SpaceRule";
import {Model} from "mongoose";
import {Context} from "koa";

class SpaceAreaController extends Controller<SpaceAreaDocument> {
  constructor(model: Model<SpaceAreaDocument>) {
    super(model)
  }

  /**
   * 获取周期内的空闲时间
   * @param ctx
   */
  async findByActivateArea(ctx: Context) {
    const {teacher, student} = ctx.query
    ctx.assert(teacher || student, 400, '参数有误')
    ctx.body = await SpaceArea.findByActivateArea({teacher, student})
  }

  /**
   * 清理 主文档被删除的文档
   * @param ctx
   */
  async clearDiscardDoc(ctx: Context) {
    ctx.body = await SpaceArea.removeNoTeacherOrStudent()
  }

  /** 自动创建空闲时间，返回创建数量 */
  async autoCreateService() {
    let createNum = 0
    // await SpaceArea.deleteMany({})
    const temp = await SpaceArea.findOne({}).sort({ startTime: -1 })
    // 获取开始自动生成空闲时间的日期

    const days = validDays(temp ? (initHour(temp.startTime).getTime() + ONE_DAY_TIME) : new Date())
    for (let i = 0; i< days.length; i ++) {
      let date = days[i]
      let week = date.getDay() === 0 ? 7 : date.getDay() // 获取星期
      const spaceRules = await SpaceRule.findByWeek(week) // 获取当天规则，含量大问题，量大需要后期分批处理
      for (let j =0; j <spaceRules.length; j++) { // 循环规则，创建空闲时间
        let spaceRule = spaceRules[j]
        const { startTime, endTime, teacher, student } = spaceRule
        let spaceArea = new SpaceArea({ startTime: copyHour(date, startTime), endTime: copyHour(date, endTime), teacher, student, spaceRule, date })
        await spaceArea.save()
        createNum++
      }
    }
    // 清除失效的空闲时间
    await SpaceArea.deleteMany({ startTime: { $lt: initHour(new Date()) } })
    return createNum
  }

  /** 自动生成空闲时间 */
  async autoCreate(ctx: Context) {
    ctx.body = {
      createNum: await this.autoCreateService()
    }
  }

  async index(ctx: Context) {
    const query = ctx.query;
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const params = { ...query }
    if (params.hasTeacher) { // 老师
      params.teacher = { $exists: true }
      delete params.hasTeacher
    }
    if (params.hasStudent) { // 学生
      params.student = { $exists: true }
      delete params.hasStudent
    }
    if (params.date) { // 按日期查找
      let start = initHour(params.date)
      let end = new Date(start.getTime() + ONE_DAY_TIME)
      params.startTime = {
        $gte: start,
        $lt: end
      }
      delete params.date
    } else if (params.startTime && params.endTime) { // 按时间有交集查找
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
      .sort({startTime: 1})
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

export default new SpaceAreaController(SpaceArea)