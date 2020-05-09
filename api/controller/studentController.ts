import {Context} from "koa";
import {Model} from "mongoose";
import {StudentDocument} from "../models";
import Student from '../models/Student';
import Controller from '../tools/Controller';
import {studentRegisterSuccess} from "../wx/pushMsg";
import SpaceRule from "../models/SpaceRule";
import SpaceArea from "../models/SpaceArea";

class StudentController extends Controller<StudentDocument> {
  constructor(model: Model<StudentDocument>) {
    super(model)
  }
  async update(ctx: Context) {
    const { body } = ctx.request
    const { status } = body
    const { id } = ctx.params
    const oldStudent = await Student.findById(id)
    await super.update(ctx)
    if (status === 1 && oldStudent && oldStudent.status !== 1) {
      await studentRegisterSuccess(body)
    }
  }

  async destroy(ctx: Context): Promise<void> {
    const id:string = ctx.params.id
    await super.destroy(ctx);

    setImmediate(async () => {
      // 删除 规则以及空闲时间
      await SpaceRule.deleteMany({student: id})
      await SpaceArea.deleteMany({student: id})
    })
  }
}

export default  new StudentController(Student)