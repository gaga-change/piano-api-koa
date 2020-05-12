import {Model} from "mongoose";
import Controller from "../tools/Controller";
import SpaceArea from "../models/SpaceArea";
import {Context} from "koa";
import Course, {CourseDocument} from "../models/Course";
import {getActivityArea, isOldDate} from "../tools/dateTools";

class CourseController extends Controller<CourseDocument> {
  constructor(model: Model<CourseDocument>) {
    super(model)
  }

  /**
   * 获取当前周期内的 所有课程
   * @param ctx
   */
  async findActivateCourse(ctx: Context) {
    const {teacher, student} = ctx.query
    ctx.assert(teacher || student, 400, '参数异常')
    ctx.body = await Course.findByActivateArea({teacher, student})
  }

  /** 创建 */
  async create(ctx: Context) {
    const body = ctx.request.body
    const {session} = ctx.state
    ctx.assert(session, 500, 'no session')
    ctx.assert(body.teacher && body.student, 400, '参数异常')
    const activityArea = getActivityArea()
    // 判断是否超出有效期的，超出不予创建
    ctx.assert(body.startTime && new Date(body.startTime) < activityArea[1], 400, '开始时间不能超过有效期')
    if (isOldDate(body.startTime)) { // 创建旧的 直接通过
      ctx.body = await Course.create(body, {session})
    } else { // 有效期内的
      // 裁剪空闲时间, 返回时间规则 绑定到 课程
      body.teacherSpaceRule = await SpaceArea.cropArea({
        startTime: body.startTime,
        endTime: body.endTime,
        teacher: body.teacher,
        session
      })
      body.studentSpaceRule = await SpaceArea.cropArea({
        startTime: body.startTime,
        endTime: body.endTime,
        student: body.student,
        session
      })
      ctx.body = await new Course(body).save()
    }

  }

  /** 删除 */
  async destroy(ctx: Context) {
    const {id} = ctx.params;
    const {session} = ctx.state
    ctx.assert(session, 500, 'no session')
    const course = await Course.findById(id, undefined, {session}).populate('teacher').populate('student')
    ctx.assert(course, 400, '课程已被删除')
    if (isOldDate(course.startTime) || (!course.student && !course.teacher)) { // 过期、没有老师和学生 直接删除
      await Course.deleteOne({_id: id}, {session})
    } else {
      const {startTime, endTime, student, teacher, teacherSpaceRule, studentSpaceRule} = course
      teacher && await SpaceArea.joinArea({startTime, endTime, teacher, spaceRule: teacherSpaceRule, session})
      student && await SpaceArea.joinArea({startTime, endTime, student, spaceRule: studentSpaceRule, session})
      await Course.deleteOne({_id: id}, {session})
    }
    ctx.body = null
  }

  /** 更新 */
  async update(ctx: Context) {
    const {id} = ctx.params;
    const item = ctx.request.body;
    const {session} = ctx.state
    ctx.assert(session, 500, 'no session')
    const course = await Course.findById(id, undefined, {session})
    ctx.assert(course, 400, '课程已被删除')
    ctx.assert(item.startTime && item.endTime, 400, "请完善数据")
    const activityArea = getActivityArea()
    // 判断是否超出有效期的，超出不予创建
    ctx.assert(item.startTime && new Date(item.startTime) < activityArea[1], 400, '开始时间不能超过有效期')
    if (course.startTime.getTime() === new Date(item.startTime).getTime()
      && course.endTime.getTime() === new Date(item.endTime).getTime()) { // 时间未改动，正常更新其他字段
      await this.Model.updateOne({_id: id}, item, {session})
    } else {
      // 如果有效期内的 还原空闲时间
      if (!isOldDate(course.startTime)) {
        const {startTime, endTime, student, teacher, teacherSpaceRule, studentSpaceRule} = course
        teacher && await SpaceArea.joinArea({startTime, endTime, teacher, spaceRule: teacherSpaceRule, session})
        student && await SpaceArea.joinArea({startTime, endTime, student, spaceRule: studentSpaceRule, session})
      }
      if (!isOldDate(item.startTime)) { // 新建的是在有效期内的，裁剪空闲时间
        item.teacherSpaceRule = await SpaceArea.cropArea({
          startTime: item.startTime,
          endTime: item.endTime,
          teacher: item.teacher,
          session
        })
        item.studentSpaceRule = await SpaceArea.cropArea({
          startTime: item.startTime,
          endTime: item.endTime,
          student: item.student,
          session
        })
      }
      // 保存
      await course.updateOne(item, {session})
    }
    ctx.body = null
  }

  async index(ctx: Context) {
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const params = {...ctx.query}
    delete params.pageSize
    delete params.pageNum
    Object.keys(params).forEach(key => {
      if (this.Model.schema.obj[key].type === String) {
        params[key] = new RegExp(params[key], 'i')
      }
    })
    const res1 = Course.find(params)
      .sort(this.defaultSort)
      .limit(pageSize)
      .populate({path: 'teacher', select: 'name'})
      .populate({path: 'student', select: 'name'})
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }
}

export default new CourseController(Course)