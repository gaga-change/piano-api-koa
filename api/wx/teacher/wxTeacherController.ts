import Teacher, {TeacherDocument} from "../../models/Teacher";
import {informTeacherRegister} from "../pushMsg";
import {Context} from "koa";


/**
 * 手机端老师注册
 * @param ctx
 */
const register = async (ctx: Context) => {
  const { body } = ctx.request
  body.status = 0 // 待审核
  let teacher: TeacherDocument | null = null
  if (body._id) {
    const _id = body._id
    teacher = await Teacher.findByIdAndUpdate(_id, body, { new: true })
  } else {
    teacher = new Teacher(body)
    await teacher.save()
  }
  setImmediate(() => {
    teacher && informTeacherRegister(teacher)
  })
  ctx.body = teacher
}

export default  {
  register
}