import Teacher, {TeacherDocument} from "../../../models/Teacher";
import {informTeacherRegister} from "../pushMsg";
import {Context} from "koa";
import {GetMapping, PostMapping, RequestMapping} from "../../../desc";
import {wxAuth, wxCheckOpenid} from "../../../middleware/wx";
import {PERSON_STATUS_READY} from "../../../config/const";
import {getToken, STUDENT_TYPE, TEACHER_TYPE} from "../../../tools/wxTools";
import axios from "axios";
import TakeCourse from "../../../models/TakeCourse";
import code from "../../../config/code";
import {mongoSession} from "../../../middleware/mongoSession";
import myAssert from "../../../tools/myAssert";
import Course from "../../../models/Course";

@RequestMapping('/wx/teacher')
export class WxTeacherController {

  /**
   * 抢课接口
   * @param ctx
   */
  @PostMapping('takeCourse', [wxAuth, mongoSession])
  async takeCourse(ctx: Context) {
    const {user, session} = ctx.state
    const teacherId = user._id
    const {takeCourseId } = ctx.request.body
    const takeCourse = await TakeCourse.findById(takeCourseId, undefined, {session}).populate('classTime')
    ctx.assert(takeCourse, code.BadRequest, '抢课已被删除')
    const oldData = await TakeCourse.findByIdAndUpdate(takeCourseId, {teacher: teacherId}, {session})
    myAssert(!oldData.teacher, '已被抢课！')
    myAssert(!oldData.cancel, '抢课已取消！')
    const classTime: any = takeCourse.classTime
    const course = new Course({
      startTime: takeCourse.startTime,
      endTime: new Date(new Date(takeCourse.startTime).getTime() + classTime.time * 60 * 1000),
      teacher: teacherId,
      student: takeCourse.student,
      classType: takeCourse.classType,
      classTime: takeCourse.classTime,
      order: takeCourse.order,
    })
    await course.save({session})
    ctx.body = null
  }

  /**
   * 手机端老师注册
   * @param ctx
   */
  @PostMapping('register', [wxCheckOpenid])
  async register(ctx: Context) {
    const {body} = ctx.request
    body.status = PERSON_STATUS_READY // 待审核
    body.openid = ctx.openid
    if (ctx.state.user) body._id = ctx.state.user._id
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


  @GetMapping('selfCode', [wxAuth])
  async getSelfQrcode(ctx: Context) {
    const teacher: TeacherDocument = ctx.state.user
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