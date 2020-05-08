import {Model} from "mongoose";
import {Context} from "koa";

import Teacher, {TeacherDocument} from '../models/Teacher';
import Controller from '../tools/Controller';
import {teacherRegisterSuccess} from "../wx/pushMsg";

class TeacherController extends Controller<TeacherDocument> {
  constructor(model: Model<any>) {
    super(model)
  }

  /**
   * 更新操作
   * @param ctx
   */
  async update(ctx: Context) {
    const test = new Teacher()
    test.name;
    const { body } = ctx.request
    const { status } = body
    const {id} = ctx.params
    const oldTeacher = await Teacher.findById(id)
    await super.update(ctx)
    if (status === 1 && oldTeacher && oldTeacher.status !== 1) {
      teacherRegisterSuccess(body)
    }
  }
}

export  default  new TeacherController(Teacher)