const code = require('./code')


function isAdmin(user) {
  return user.username === 'admin' && user.password === '123456'
}

function isCustomer(user) {
  return user.username === 'xiaozhang' && user.password === '123456'
}

module.exports = {
  /** 登录 */
  async login(ctx) {
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
  async checkAuth(ctx, next) {
    ctx.assert(ctx.session.user, code.Unauthorized, '用户未登录')
    await next()
  },
  /** 校验是否未 admin 权限 */
  async checkAdmin(ctx, next) {
    ctx.assert(ctx.session.user && ctx.session.user.role === 'admin', code.Forbidden, '无权操作')
    await next()
  },
  /** 获取当前登录用户 */
  async account(ctx) {
    ctx.body = ctx.session.user
  },
  /** 退出登录 */
  async logout(ctx) {
    ctx.session.user = null
  }
}