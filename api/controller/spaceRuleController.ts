import Application, {Context} from "koa";
import {GetMapping, Inject, PostMapping, RequestMapping} from "../desc";
import SpaceRule, {SpaceRuleDocument} from "../models/SpaceRule";

import Controller from "../tools/Controller";
import Person, {PersonDocument} from "../models/Person";
import {checkAuth} from "../middleware/auth";
import {mongoSession} from "../middleware/mongoSession";
import {STUDENT_DB_NAME, TEACHER_DB_NAME} from "../config/dbName";
import Course, {CourseDocument} from "../models/Course";
import {copyFullYears, ONE_DAY_TIME} from "../tools/dateTools";

interface SpaceAreaDocument {
  startTime: Date
  endTime: Date
}

const cropAreaTime = (spaceAreas: Array<SpaceAreaDocument>, courses: Array<CourseDocument>):Array<SpaceAreaDocument>  => {
  for (let j = 0; j < courses.length; j++) {
    const course: CourseDocument = courses[j]
    const {startTime: st, endTime: et} = course
    let newTemp: { startTime: Date; endTime: Date; }[] = []
    spaceAreas.forEach(({startTime, endTime}) => {
      // 获取交集
      const intersectionArea = [Math.max(startTime.getTime(), st.getTime()), Math.min(endTime.getTime(), et.getTime())]
      // 判断交集是否成立
      if(intersectionArea[1] > intersectionArea[0]) {
        // 从area01中 删除交集
        if (startTime.getTime() < intersectionArea[0]) {
          newTemp.push({startTime, endTime: new Date(intersectionArea[0] - 60 * 1000)})
        }
        if (intersectionArea[1] < endTime.getTime()) {
          newTemp.push({startTime: new Date(intersectionArea[1] + 60 * 1000), endTime})
        }
      } else {
        newTemp.push({startTime, endTime})
      }
    })
    spaceAreas = newTemp
  }
  return spaceAreas
}

@RequestMapping('spaceRules')
export class SpaceRuleController extends Controller<SpaceRuleDocument> {
  @Inject(SpaceRule)
  Model: any

  /**
   * 清理 主文档被删除的文档
   * @param ctx
   */
  @PostMapping('spaceRulesClearNoTeacherOrStudent', [checkAuth])
  async clearDiscardDoc(ctx: Context) {
    ctx.body = await SpaceRule.removeNoTeacherOrStudent()
  }

  /** 批量修改 */
  @PostMapping('spaceRulesUpdate', [checkAuth, mongoSession])
  async modify(ctx: Context) {
    const {session} = ctx.state
    const {del: delIds = [], add: addItems = [], person} = ctx.request.body
    ctx.assert(delIds.length || addItems.length, 400, '参数异常')
    for (let i in addItems) {
      let temp = {...addItems[i], person}
      await new SpaceRule(temp).save({session})
    }
    if (delIds.length) {
      await SpaceRule.deleteMany({_id: {$in: delIds}}, {session})
    }
    // 校验规则（不能有连续的时间，不能重叠）
    {
      const rules = await SpaceRule.find({person}, undefined, {session}).sort('startTime')
      if (rules.length > 1) {
        for (let i = 0; i < (rules.length - 1); i++) {
          let temp = rules[i]
          let next = rules[i + 1]
          ctx.assert(temp.endTime.getTime() < next.startTime.getTime(), 400, '时间段不能连续或重叠')
        }
      }
    }
    ctx.body = ctx.request.body
  }

  /**
   * 获取个人空闲时间
   * @param ctx
   */
  @GetMapping('getSelfSpaceAreaInSpaceRule', [checkAuth])
  async getSelfSpaceAreaInSpaceRule(ctx: Context) {
    const query = ctx.query
    ctx.assert(query.date, 400, 'date 必传')
    const oneDay: Date = new Date(query.date)
    const person: PersonDocument = await Person.findById(query.person)
    ctx.assert(person, 400, '人物已被删除')
    // 查询时间有交集的规则
    // 1. 查询个人规则
    let startTime = new Date(2019, 6, oneDay.getDay() === 0 ? 7 : oneDay.getDay(), 0, 0, 0, 0)
    let endTime = new Date(2019, 6, (oneDay.getDay() === 0 ? 7 : oneDay.getDay()) + 1, 0, 0, 0, 0)
    const spaceRules = await SpaceRule.find({startTime: {$gte: startTime}, endTime: {$lt: endTime}, person})
    let spaceAreas: Array<SpaceAreaDocument> = spaceRules.map(v => ({
      startTime: copyFullYears(v.startTime, oneDay),
      endTime: copyFullYears(v.endTime, oneDay)
    }))
    startTime = copyFullYears(startTime, oneDay)
    endTime = new Date(startTime.getTime() + ONE_DAY_TIME)
    // 查询有交集的课程，进行裁剪
    const courses = await Course.find({
      startTime: {$gte: startTime},
      endTime: {$lt: endTime}, ...(person.kind === STUDENT_DB_NAME ? {student: person} : {teacher: person})
    })
    ctx.body = cropAreaTime(spaceAreas, courses).map(v => ({...v, person}))
  }

  /**
   * 传递时间范围，查询符合条件对象的空闲时间
   * @param ctx
   */
  @GetMapping('getSpaceArea', [checkAuth])
  async getSpaceArea(ctx: Context) {
    const query = ctx.query
    ctx.assert(query.startTime && query.endTime, 400, 'startTime, endTime 必传')
    const startTime: Date = new Date(query.startTime)
    const endTime: Date = new Date(query.endTime)
    const yearMonthDate: [number, number, number] = [startTime.getFullYear(), startTime.getMonth(), startTime.getDate()]
    const person: PersonDocument = await Person.findById(query.person)
    ctx.assert(person, 400, '人物已被删除')
    const isTeacher = person.kind === TEACHER_DB_NAME
    // 查询时间有交集的规则
    // 1. 目标对象是学生 则拉取所有老师
    // 2. 时间区间需要有交集
    const spaceRules = await SpaceRule.findByTimeArea(startTime, endTime, isTeacher ? STUDENT_DB_NAME : TEACHER_DB_NAME)
    // 查询有交集的课程，进行裁剪
    let out = []
    for (let i = 0; i < spaceRules.length; i++) {
      const spaceRule: SpaceRuleDocument = spaceRules[i]
      const {startTime, endTime} = spaceRule
      startTime.setFullYear(...yearMonthDate)
      endTime.setFullYear(...yearMonthDate)
      const person: any = spaceRule.person
      const courses = await Course.find({
        ...(person.kind === STUDENT_DB_NAME ? {student: person} : {teacher: person}),
        $or: [
          {startTime: {$gte: startTime, $lt: endTime}},
          {endTime: {$gt: startTime, $lte: endTime}},
          {startTime: {$lte: startTime}, endTime: {$gte: endTime}}
        ]
      })
      let spaceAreas: Array<SpaceAreaDocument> = [{startTime, endTime}]
      out.push(...cropAreaTime(spaceAreas, courses).map(v => ({...v, person})))
    }
    console.log(out.map(v => ({...v, person: v.person})))
    // 保留交集
    ctx.body = out.map((obj) => {
      const st = Math.max(obj.startTime.getTime(), startTime.getTime())
      const et = Math.min(obj.endTime.getTime(), endTime.getTime())
      return {
        startTime: new Date(st),
        endTime: new Date(et),
        person: obj.person
      }
    }).filter((obj) => {
      return obj.startTime < obj.endTime
    })
  }

  @GetMapping('')
  async index(ctx: Application.Context): Promise<void> {
    await super.index(ctx);
  }
}