import {Context} from "koa";
import {Model} from "mongoose";
import {StudentDocument} from "../models";
import Student from '../models/Student';
import Controller from '../tools/Controller';
import {studentRegisterSuccess} from "../wx/pushMsg";

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
}

export default  new StudentController(Student)