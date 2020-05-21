import {Context, Next} from "koa";
import code from "../config/code";

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