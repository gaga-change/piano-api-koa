import {Context, Next} from "koa";
import code from "../config/code";

/** 校验是否登录 */
export const checkAuth: any = async (ctx: Context, next: Next) => {
  ctx.assert(ctx.session.user, code.Unauthorized, '用户未登录')
  await next()
}

/** 校验是否未 admin 权限 */
export const checkAdmin: any = async (ctx: Context, next: Next) => {
  ctx.assert(ctx.session.user && ctx.session.user.role === 'admin', code.Forbidden, '无权操作')
  await next()
}