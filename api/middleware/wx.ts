import {Context, Next} from "koa";
import code from "../config/code";
import Person from "../models/Person";
import {PERSON_STATUS_PASS} from "../config/const";

/** 微信登录校验 */
export const teacherAuth: any = async (ctx: Context, next: Next) => {
  ctx.assert(ctx.session && ctx.session.teacherOpenid, code.Unauthorized, "请在微信平台上操作")
  await next()
}
/** 微信登录校验 */
export const studentAuth: any = async (ctx: Context, next: Next) => {
  ctx.assert(ctx.session && ctx.session.studentOpenid, code.Unauthorized, "请在微信平台上操作")
  await next()
}
/** 微信用户校验 */
export const wxAuth: any = async (ctx: Context, next: Next) => {
  const openid = ctx.session.studentOpenid || ctx.session.teacherOpenid
  ctx.assert(openid, code.Unauthorized, "用户未登录")
  const {user: userInfo} = ctx.session
  ctx.assert(userInfo, code.Forbidden, "用户未提交资料")
  const user = await Person.findById(userInfo.id)
  ctx.assert(user.status === PERSON_STATUS_PASS, code.Forbidden, "用户暂未审核通过")
  ctx.session.user = user
  ctx.state.user = user
  await next()
}