import code from "../config/code";
import {UserDocument} from "../models/User";
import {Context, Next} from "koa";


function isAdmin(user: UserDocument) {
  return user.username === 'admin' && user.password === '123456'
}

function isCustomer(user:UserDocument) {
  return user.username === 'xiaozhang' && user.password === '123456'
}

export default {
  /** 登录 */
  async login(ctx: Context) {
    const { body } = ctx.request
    ctx.assert(isAdmin(body) || isCustomer(body), code.BadRequest, '用户名或密码错误！')
    if (isAdmin(body)) {
      ctx.session.user = { name: 'admin', role: 'admin' }
    } else {
      ctx.session.user = { name: '小张' }
    }
    ctx.body = ctx.session.user
  },
  /** 校验是否登录 */
  async checkAuth(ctx: Context, next: Next) {
    ctx.assert(ctx.session.user, code.Unauthorized, '用户未登录')
    await next()
  },
  /** 校验是否未 admin 权限 */
  async checkAdmin(ctx: Context, next: Next) {
    ctx.assert(ctx.session.user && ctx.session.user.role === 'admin', code.Forbidden, '无权操作')
    await next()
  },
  /** 获取当前登录用户 */
  async account(ctx: Context) {
    ctx.body = ctx.session.user
  },
  /** 退出登录 */
  async logout(ctx: Context) {
    ctx.session.user = null
    ctx.body = null
  }
}