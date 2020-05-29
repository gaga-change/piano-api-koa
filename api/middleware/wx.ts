import {Context, Next} from "koa";
import code from "../config/code";
import {PERSON_STATUS_PASS} from "../config/const";
import Teacher from "../models/Teacher";
import Student from "../models/Student";

/** 微信openid校验 */
export const wxCheckOpenid: any = async (ctx: Context, next: Next) => {
  const openid = ctx.openid
  ctx.assert(openid, code.Unauthorized, "用户未登录")
  if (ctx.isTeacher) {
    ctx.state.user = await Teacher.findOne({openid})
  } else {
    ctx.state.user = await Student.findOne({openid})
  }
  await next()
}

/** 微信用户校验 */
export const  wxAuth: any = async (ctx: Context, next: Next) => {
  const openid = ctx.openid
  ctx.assert(openid, code.Unauthorized, "用户未登录")
  let user
  if (ctx.isTeacher) {
    user = await Teacher.findOne({openid})
  } else {
    user = await Student.findOne({openid})
  }
  ctx.assert(user, code.Forbidden, "用户未提交资料")
  ctx.assert(user.status === PERSON_STATUS_PASS, code.Forbidden, "用户暂未审核通过")
  ctx.state.user = user
  await next()
}