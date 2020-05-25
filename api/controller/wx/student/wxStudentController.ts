import Student, {StudentDocument} from "../../../models/Student";
import {Context} from "koa";
import {informStudentRegister} from "../pushMsg";
import {PostMapping, RequestMapping} from "../../../desc";
import {studentAuth} from "../../../middleware/wx";
import {PERSON_STATUS_READY} from "../../../config/const";


@RequestMapping('/wx/student')
export class WxStudentController {

  /**
   * 手机端学生注册
   * @param ctx
   */
  @PostMapping('register', [studentAuth])
  async register(ctx: Context) {
    const {body} = ctx.request
    body.status = PERSON_STATUS_READY // 待审核
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
}