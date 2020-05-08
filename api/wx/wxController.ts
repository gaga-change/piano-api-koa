import {Context, Next} from "koa";
import {getAppidAndsecret, isStudent, isTeacher, syncTags} from "../tools/wxTools";
import code from "../config/code";
import axios from 'axios'


export default  {
  /** 同步微信标签 */
  async wxTagSync(ctx: Context) {
    const { type } = ctx.params
    ctx.body = await syncTags(type)
  },
  /** 微信登录 */
  async wxLogin(ctx: Context) {
    const { type } = ctx.params
    const { appid, secret } = getAppidAndsecret(type)
    if ((isTeacher(type) && ctx.session && ctx.session.teacherOpenid) ||
      (isStudent(type) && ctx.session && ctx.session.studentOpenid)
    ) {
      return ctx.body = {
        teacherOpenid: ctx.session.teacherOpenid,
        studentOpenid: ctx.session.studentOpenid,
      }
    }
    const { code: wxCode } = ctx.query
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
      if (isTeacher(type)) {
        ctx.session.teacherOpenid = res.data.openid
      } else {
        // @ts-ignore
        ctx.session.studentOpenid = res.data.openid
      }
      ctx.body = {
        teacherOpenid: ctx.session && ctx.session.teacherOpenid,
        studentOpenid: ctx.session && ctx.session.studentOpenid,
      }
    }
  },
  /** 获取 openid */
  async wxAccount(ctx: Context) {
    ctx.body = {
      teacherOpenid: ctx.session && ctx.session.teacherOpenid,
      studentOpenid: ctx.session && ctx.session.studentOpenid,
    }
  },
  /** 微信登录校验 */
  async teacherAuth(ctx: Context, next: Next) {
    ctx.assert(ctx.session && ctx.session.teacherOpenid, code.Unauthorized, "请在微信平台上操作")
    await next()
  },
  /** 微信登录校验 */
  async studentAuth(ctx: Context, next: Next) {
    ctx.assert(ctx.session && ctx.session.studentOpenid, code.Unauthorized, "请在微信平台上操作")
    await next()
  },
}