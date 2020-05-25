import {Context} from "koa";
import {getAppidAndsecret, isStudent, isTeacher, syncTags} from "../../tools/wxTools";
import code from "../../config/code";
import axios from 'axios'
import Teacher, {TeacherDocument} from "../../models/Teacher";
import Student, {StudentDocument} from "../../models/Student";
import {GetMapping, PostMapping, RequestMapping} from "../../desc";
import {checkAuth} from "../../middleware/auth";
import convert from 'xml-js'
import Person from "../../models/Person";
import Share from "../../models/Share";

@RequestMapping('wx')
export class WxController {
  /** 同步微信标签 */
  @GetMapping(':type/tagsSync', [checkAuth])
  async wxTagSync(ctx: Context) {
    const {type} = ctx.params
    ctx.body = await syncTags(type)
  }

  /** 微信登录 */
  @GetMapping(':type/login')
  async wxLogin(ctx: Context) {
    const {type} = ctx.params
    const {appid, secret} = getAppidAndsecret(type)
    if ((isTeacher(type) && ctx.session && ctx.session.teacherOpenid) ||
      (isStudent(type) && ctx.session && ctx.session.studentOpenid)
    ) {
      return ctx.body = {
        teacherOpenid: ctx.session.teacherOpenid,
        studentOpenid: ctx.session.studentOpenid,
      }
    }
    const {code: wxCode} = ctx.query
    ctx.assert(wxCode, code.BadRequest, "需要传递参数 code")
    const res = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
      params: {
        appid,
        secret,
        code: wxCode,
        grant_type: 'authorization_code'
      }
    })
    if (!res.data.openid) {
      ctx.status = code.BadRequest
      ctx.body = res.data
    } else {
      let userInfo: TeacherDocument | StudentDocument
      if (isTeacher(type)) {
        ctx.session.teacherOpenid = res.data.openid
        userInfo = await Teacher.findOne({openid: res.data.openid})
      } else {
        ctx.session.studentOpenid = res.data.openid
        userInfo = await Student.findOne({openid: res.data.openid})
      }
      ctx.body = {
        teacherOpenid: ctx.session && ctx.session.teacherOpenid,
        studentOpenid: ctx.session && ctx.session.studentOpenid,
        userInfo
      }
    }
  }

  /** 获取 openid */
  @GetMapping('account')
  async wxAccount(ctx: Context) {
    ctx.body = {
      teacherOpenid: ctx.session && ctx.session.teacherOpenid,
      studentOpenid: ctx.session && ctx.session.studentOpenid,
      userInfo: ctx.session && ctx.session.userInfo
    }
  }

  /** 微信服务 */
  @GetMapping('server')
  async wxServer(ctx: Context) {

    // var token="weixin";
    // var signature = ctx.query.signature;
    // var timestamp = ctx.query.timestamp;
    // var nonce     = ctx.query.nonce;
    ctx.body = ctx.query.echostr

  }

  /** 微信服务 */
  @PostMapping('server')
  async wxPostServer(ctx: Context) {

    const res: any = convert.xml2js(ctx.request.body, {compact: true})
    const event: string = res.xml.Event._cdata
    const msgType: string = res.xml.MsgType._cdata
    const fromUserName: string = res.xml.FromUserName._cdata
    const ticket: string | undefined = res.xml.Ticket && res.xml.Ticket._cdata
    if (msgType === 'event' && event === 'subscribe' && ticket) { // 订阅事件
      console.log('===== person')
      const person = await Person.findOne({qrcodeTeacherTicket: ticket}) // 分享的人
      console.log('===== person', person && person.name)
      if (person && person.openid !== fromUserName) { // 确定分享的人还在 并且不是本人
        const exist = await Share.findOne({shareOpenid: person.openid, subscribeOpenid: fromUserName})
        if (!exist) { // 确定没有重复，防止取消后重写关注
          console.log('openid', person.openid)
          await new Share({shareOpenid: person.openid, subscribeOpenid: fromUserName}).save()
        }
      }
    } else if (msgType === 'event' && event === 'unsubscribe') { // 取消订阅
      await Share.deleteMany({subscribeOpenid: fromUserName}) // 删除原有分享关系
    }
    ctx.body = ""
  }
}