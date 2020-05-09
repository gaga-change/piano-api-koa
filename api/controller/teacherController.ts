import {Model} from "mongoose";
import {Context} from "koa";

import Teacher, {TeacherDocument} from '../models/Teacher';
import Controller from '../tools/Controller';
import {teacherRegisterSuccess} from "../wx/pushMsg";
import SpaceRule from "../models/SpaceRule";
import SpaceArea from "../models/SpaceArea";

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
      setImmediate(async () => {
        await teacherRegisterSuccess(body)
      })
    }
  }

  async destroy(ctx: Context): Promise<void> {
    const id:string = ctx.params.id
    await super.destroy(ctx);
    setImmediate(async () => {
      // 删除 规则以及空闲时间
      await SpaceRule.deleteMany({teacher: id})
      await SpaceArea.deleteMany({teacher: id})
    })
  }
}

export  default  new TeacherController(Teacher)