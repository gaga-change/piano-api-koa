import LeaveArea, {LeaveAreaDocument} from "../models/LeaveArea";
import Controller from "../tools/Controller";
import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../desc";
import {Context} from "koa";
import {checkAuth} from "../middleware/auth";
import {COURSE_STATUS_NO_PASS, LEAVE_AREA_STATUS_PASS} from "../config/const";
import Course from "../models/Course";
import Person from "../models/Person";
import {TEACHER_DB_NAME} from "../config/dbName";
import code from "../config/code";
import only from "../tools/only";

/**
 * 请假通过
 * @param leaveArea
 */
const passLeaveArea = async (leaveArea: LeaveAreaDocument) => {
    const course = await Course.findById(leaveArea.course)
    const person = await Person.findById(leaveArea.person)
    if (course && person) {
      let adverse
      if (person.kind === TEACHER_DB_NAME) { // 通过后把课程的对象删除
        adverse = course.student
        course.student = undefined // 老师请假 则解除学生的课程绑定
      } else {
        adverse = course.student
        course.student = undefined
      }
      course.status = COURSE_STATUS_NO_PASS // 课程状态改为已取消
      leaveArea.adverse = adverse
      await leaveArea.save()
      await course.save()
    }
}

@RequestMapping("leaveAreas")
export class LeaveAreaController extends Controller<LeaveAreaDocument> {

  @Inject(LeaveArea)
  Model: any

  @PostMapping("", [checkAuth])
  async create(ctx: Context): Promise<void> {
    let body = ctx.request.body;

    const leaveArea = new LeaveArea(body)
    await leaveArea.save()
    if (leaveArea.status === LEAVE_AREA_STATUS_PASS) { // 生效
      await passLeaveArea(leaveArea)
    }
    ctx.body = leaveArea
  }

  @DeleteMapping(":id", [checkAuth])
  async destroy(ctx: Context): Promise<void> {
    await super.destroy(ctx);
  }

  @PutMapping(":id", [checkAuth])
  async update(ctx: Context): Promise<void> {
    const {id} = ctx.params;
    const body: LeaveAreaDocument = ctx.request.body;
    // 只允许修改备注和状态
    const leaveArea = await LeaveArea.findOneAndUpdate({_id: id}, only(body, 'remark status'))
    ctx.assert(leaveArea, code.BadRequest, "数据已被删除！")
    if (leaveArea.status !== LEAVE_AREA_STATUS_PASS && body.status === LEAVE_AREA_STATUS_PASS) { // 之前未通过，然后改成通过
      await passLeaveArea(leaveArea)
    }
    ctx.body = null
  }

  @GetMapping(":id")
  async show(ctx: Context): Promise<void> {
    await super.show(ctx);
  }

  @GetMapping("")
  async index(ctx: Context): Promise<void> {
    const query = ctx.query;
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const params = {...query}
    delete params.pageSize
    delete params.pageNum
    Object.keys(params).forEach(key => {
      if (this.Model.schema.obj[key] && this.Model.schema.obj[key].type === String) {
        params[key] = new RegExp(params[key], 'i')
      }
    })
    const res1 = this.Model.find(params)
      .populate('course')
      .populate('person')
      .populate('adverse')
      .sort(this.defaultSort || {createdAt: -1})
      .limit(pageSize)
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }
}