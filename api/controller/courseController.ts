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

@RequestMapping('courses')
export  class CourseController extends Controller<CourseDocument> {

  @Inject(Course)
  Model: any

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
  async findByPersonAndDay (ctx : Context) {
    const {person : personId, date: dateStr} = ctx.query
    const person = await  Person.findById(personId)
    ctx.assert(person && dateStr, code.BadRequest, '参数异常')
    const startTime = initHour(dateStr)
    const endTime = new Date(startTime.getTime() + ONE_DAY_TIME)
    ctx.body = await Course.find({
      ...(person.kind === TEACHER_DB_NAME ? {teacher: person} : {student: person}),
      startTime: { $gte: startTime, $lt: endTime },
      status: COURSE_STATUS_READY
    }).populate('teacher').populate('student')
  }

  /** 创建 */
  @PostMapping('', [checkAuth,])
  async create(ctx: Context) {
    const body = ctx.request.body
    ctx.assert(body.teacher && body.student, 400, '参数异常')
    // 判断是否重叠
    const {startTime, endTime, teacher, student} = body
    const coursesByStudent = await Course.findByTimeArea(startTime, endTime, undefined, student )
    ctx.assert(coursesByStudent.length === 0, 400, '学生课程时间有重叠')
    const courseByTeacher =  await Course.findByTimeArea(startTime, endTime, teacher, undefined )
    ctx.assert(courseByTeacher.length === 0, 400, '教师课程时间有重叠')
    ctx.body = await Course.create(body)
  }

  /** 删除 */
  @DeleteMapping(':id', [checkAuth])
  async destroy(ctx: Context) {
    const {id} = ctx.params;
    ctx.body = await Course.deleteOne({_id: id})
  }

  /** 更新 */
  @PutMapping(':id', [checkAuth])
  async update(ctx: Context) {
    const {id} = ctx.params;
    const body = ctx.request.body;
    // 判断是否重叠
    const {startTime, endTime, teacher, student} = body
    const coursesByStudent = await Course.findByTimeArea(startTime, endTime, undefined, student )
    ctx.assert(coursesByStudent.length <= 1, 400, '学生课程时间有重叠')
    const courseByTeacher =  await Course.findByTimeArea(startTime, endTime, teacher, undefined )
    ctx.assert(courseByTeacher.length <= 1, 400, '教师课程时间有重叠')
    ctx.body =   await this.Model.updateOne({_id: id}, body)
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
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }
}

export default new CourseController(Course)