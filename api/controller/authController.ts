import code from "../config/code";
import {UserDocument} from "../models/User";
import {Context} from "koa";
import {Controller, GetMapping, PostMapping} from "../desc";
import {checkAuth} from "../middleware/auth";


function isAdmin(user: UserDocument) {
  return user.username === 'admin' && user.password === '123456'
}

function isCustomer(user:UserDocument) {
  return user.username === 'xiaozhang' && user.password === '123456'
}


@Controller('auth')
export class AuthController {
  /** 登录 */
  @PostMapping('login')
  async login(ctx: Context) {
    const { body } = ctx.request
    ctx.assert(isAdmin(body) || isCustomer(body), code.BadRequest, '用户名或密码错误！')
    if (isAdmin(body)) {
      ctx.session.user = { name: 'admin', role: 'admin' }
    } else {
      ctx.session.user = { name: '小张' }
    }
    ctx.body = ctx.session.user
  }
  /** 退出登录 */
  @PostMapping('logout')
  async logout(ctx: Context) {
    ctx.session.user = null
    ctx.body = null
  }
  /** 获取当前登录用户 */
  @GetMapping('account', [checkAuth])
  async account(ctx: Context) {
    ctx.body = ctx.session.user
  }
}