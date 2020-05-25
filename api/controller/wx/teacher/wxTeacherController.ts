import Teacher, {TeacherDocument} from "../../../models/Teacher";
import {informTeacherRegister} from "../pushMsg";
import {Context} from "koa";
import {GetMapping, PostMapping, RequestMapping} from "../../../desc";
import {teacherAuth} from "../../../middleware/wx";
import {PERSON_STATUS_READY} from "../../../config/const";
import {getToken, STUDENT_TYPE, TEACHER_TYPE} from "../../../tools/wxTools";
import axios from "axios";

@RequestMapping('/wx/teacher')
export class WxTeacherController {
  /**
   * 手机端老师注册
   * @param ctx
   */
  @PostMapping('register', [teacherAuth])
  async register(ctx: Context) {
    const {body} = ctx.request
    body.status = PERSON_STATUS_READY // 待审核
    let teacher: TeacherDocument | null = null
    if (body._id) {
      const _id = body._id
      teacher = await Teacher.findByIdAndUpdate(_id, body, {new: true})
    } else {
      teacher = new Teacher(body)
      await teacher.save()
    }
    setImmediate(async () => {
      if (teacher) {
        await informTeacherRegister(teacher)
      }
    })
    ctx.body = teacher
  }


  @GetMapping('selfCode', [teacherAuth])
  async getSelfQrcode(ctx: Context) {
    const teacher = await Teacher.findOne({openid: ctx.session.teacherOpenid})
    ctx.assert(teacher, 400, '用户未注册')
    if (!teacher.qrcodeTeacherTicket) {
      const token = await getToken(TEACHER_TYPE)
      const res: { data: { ticket: string; url: string } } = await axios.post(`https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`, {
        "action_name": "QR_LIMIT_SCENE",
        "action_info": {"scene": {"scene_id": 0}}
      })
      teacher.qrcodeTeacherTicket = res.data.ticket
      await teacher.save()
    }
    if (!teacher.qrcodeStudentTicket) {
      const token = await getToken(STUDENT_TYPE)
      const res: { data: { ticket: string; url: string } } = await axios.post(`https://api.weixin.qq.com/cgi-bin/qrcode/create?access_token=${token}`, {
        "action_name": "QR_LIMIT_SCENE",
        "action_info": {"scene": {"scene_id": 0}}
      })
      teacher.qrcodeStudentTicket = res.data.ticket
      await teacher.save()
    }
    ctx.body = {
      teacher: `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${teacher.qrcodeTeacherTicket}`,
      student:
        `https://mp.weixin.qq.com/cgi-bin/showqrcode?ticket=${teacher.qrcodeStudentTicket}`
    }
  }
}