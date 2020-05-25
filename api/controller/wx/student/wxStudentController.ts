import Student, {StudentDocument} from "../../../models/Student";
import {Context} from "koa";
import {informStudentRegister} from "../pushMsg";
import {GetMapping, PostMapping, RequestMapping} from "../../../desc";
import {studentAuth} from "../../../middleware/wx";
import {PERSON_STATUS_READY} from "../../../config/const";
import axios from 'axios';
import {getToken, STUDENT_TYPE} from "../../../tools/wxTools";

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

  @GetMapping('selfCode', [studentAuth])
  async getSelfQrcode(ctx: Context) {
    const token = await getToken(STUDENT_TYPE)
    const student = await Student.findOne({openid: ctx.session.studentOpenid})
    ctx.assert(student, 400, '用户未注册')
    if (!student.qrcodeTicket) {
      const res: { ticket: string; expire_seconds: number; url: string } = await axios.post(`https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`, {
        "action_name": "QR_LIMIT_SCENE",
        "action_info": {"scene": {"scene_id": 123}}
      })
      student.qrcodeTicket = res.ticket
      await student.save()
    }
    ctx.body = `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${student.qrcodeTicket}`
  }
}