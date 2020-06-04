import Course, {CourseDocument} from "../models/Course";
import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../desc";

import {Context} from "koa";
import Controller from "../tools/Controller";
import {checkAuth} from "../middleware/auth";
import Person from "../models/Person";
import {initHour, ONE_DAY_TIME} from "../tools/dateTools";
import {TEACHER_DB_NAME} from "../config/dbName";
import code from "../config/code";
import {COURSE_STATUS_READY} from "../config/const";
import ClassTime from "../models/ClassTime";
import LeaveArea from "../models/LeaveArea";

@RequestMapping('courses')
export class CourseController extends Controller<CourseDocument> {

  @Inject(Course)
  Model: any

  /**
   * 查询某人某月的所有课程
   * @param ctx
   */
  @GetMapping('findByPersonAndMonth')
  async findByPersonAndMonth(ctx: Context) {
    const {person, month} = ctx.query
    ctx.assert(person && month, code.BadRequest, '参数不全')
    const monthStart = new Date(month)
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)
    const monthEnd = new Date(monthStart)
    if (monthStart.getMonth() === 11) {
      monthEnd.setMonth(0)
      monthEnd.setFullYear(monthStart.getFullYear() + 1)
    } else {
      monthEnd.setMonth(monthStart.getMonth() + 1)
    }
    ctx.body = await Course.find({
      $or: [{teacher: person}, {student: person}],
      startTime: {$gte: monthStart, $lt: monthEnd}
    }).populate('teacher').populate('student').populate('classType').populate('classTime')
  }

  /**
   * 获取当前周期内的 所有课程
   * @param ctx
   */
  @GetMapping('coursesActivateArea')
  async findActivateCourse(ctx: Context) {
    const {teacher, student} = ctx.query
    ctx.assert(teacher || student, 400, '参数异常')
    ctx.body = await Course.findByActivateArea({teacher, student})
  }

  /**
   * 获取某人某天未开始的课程
   * @param ctx
   */
  @GetMapping('findByPersonAndDay')
  async findByPersonAndDay(ctx: Context) {
    const {person: personId, date: dateStr} = ctx.query
    const person = await Person.findById(personId)
    ctx.assert(person && dateStr, code.BadRequest, '参数异常')
    const startTime = initHour(dateStr)
    const endTime = new Date(startTime.getTime() + ONE_DAY_TIME)
    ctx.body = await Course.find({
      ...(person.kind === TEACHER_DB_NAME ? {teacher: person} : {student: person}),
      startTime: {$gte: startTime, $lt: endTime},
      status: COURSE_STATUS_READY
    }).populate('teacher').populate('student')
  }

  /** 创建 */
  @PostMapping('', [checkAuth,])
  async create(ctx: Context) {
    const body = ctx.request.body
    // 判断是否重叠
    const {startTime, teacher, student} = body
    ctx.assert(startTime && teacher && student && body.classTime, 400, '参数异常')
    // 手动计算结束事件
    const classTime = await ClassTime.findById(body.classTime)
    ctx.assert(classTime, code.BadRequest, '请选择课时长')
    const endTime = new Date(new Date(startTime).getTime() + classTime.time * 60 * 1000)
    const coursesByStudent = await Course.findByTimeArea(startTime, endTime, undefined, student, {status: COURSE_STATUS_READY})
    ctx.assert(coursesByStudent.length === 0, 400, '学生课程时间有重叠')
    const courseByTeacher = await Course.findByTimeArea(startTime, endTime, teacher, undefined, {status: COURSE_STATUS_READY})
    ctx.assert(courseByTeacher.length === 0, 400, '教师课程时间有重叠')
    body.endTime = endTime
    ctx.body = await Course.create(body)
  }

  /** 删除 */
  @DeleteMapping(':id', [checkAuth])
  async destroy(ctx: Context) {
    const {id} = ctx.params;
    const res = await Course.deleteOne({_id: id})
    setImmediate(async () => {
      // 删除相应的请假记录
      await LeaveArea.deleteMany({course: id})
    })
    ctx.body = res
  }

  /** 更新 */
  @PutMapping(':id', [checkAuth])
  async update(ctx: Context) {
    const {id} = ctx.params;
    const body = ctx.request.body;
    // 判断是否重叠
    const {startTime, teacher, student} = body
    ctx.assert(startTime && teacher && student && body.classTime, 400, '参数异常')
    // 手动计算结束事件
    const classTime = await ClassTime.findById(body.classTime)
    ctx.assert(classTime, code.BadRequest, '请选择课时长')
    const endTime = new Date(new Date(startTime).getTime() + classTime.time * 60 * 1000)
    // 查询和非本课程的其他课程 是否有重叠，排除对方请假的
    const coursesByStudent = await Course.findByTimeArea(startTime, endTime, undefined, student, {
      _id: {$ne: id},
      status: COURSE_STATUS_READY
    })
    ctx.assert(coursesByStudent.length === 0, 400, '学生课程时间有重叠')
    const courseByTeacher = await Course.findByTimeArea(startTime, endTime, teacher, undefined, {
      _id: {$ne: id},
      status: COURSE_STATUS_READY
    })
    ctx.assert(courseByTeacher.length === 0, 400, '教师课程时间有重叠')
    body.endTime = endTime
    ctx.body = await this.Model.updateOne({_id: id}, body)
  }

  @GetMapping(':id')
  async show(ctx: Context): Promise<void> {
    await super.show(ctx);
  }

  @GetMapping('')
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
      .populate({path: 'classType', select: 'name'})
      .populate({path: 'classTime', select: 'name time'})
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }
}
