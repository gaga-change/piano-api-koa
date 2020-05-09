import Student, {StudentDocument} from "../../models/Student";
import {Context} from "koa";
import {informStudentRegister} from "../pushMsg";


/**
 * 手机端学生注册
 * @param ctx
 */
const register = async (ctx: Context) => {
  const {body} = ctx.request
  body.status = 0 // 待审核
  let student: StudentDocument | null
  if (body._id) { // 有id为编辑
    const _id = body._id
    student = await Student.findByIdAndUpdate(_id, body, {new: true})
  } else { // 没有则为创建
    student = new Student(body)
    await student.save()
  }
  setImmediate(async () => {
    if (student) {
      await informStudentRegister(student)
    }
  })

  ctx.body = student
}
export default {
  register
}