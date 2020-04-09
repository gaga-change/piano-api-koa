const WxCache = require('./models/WxCache')
const code = require('./code')
const axios = require('axios')
const appid = 'wxa2c0420dfeaf8d24'
const secret = '97c578ea751117d8c77fc63480cba424'

async function getToken() {
  let wxCache = await WxCache.findOne({})
  if (wxCache === null) { // 若无，则建立
    wxCache = new WxCache()
  }
  if (wxCache.token && (Date.now() - wxCache.updatedAt.getTime()) < 1000 * 60 * 100) {
    console.log("读取缓存 wxCache - ")
  } else { // 超时
    console.log("缓存失效或未读取，重新获取", new Date().toLocaleString())
    const { data } = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`)
    const token = data.access_token
    console.log(token)
    wxCache.token = token
    await wxCache.save()
  }
  return wxCache.token
}


module.exports = {
  /** 微信登录 */
  async wxLogin(ctx) {
    if (ctx.session.openid) {
      return ctx.body = ctx.session.openid
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
      ctx.body = ctx.session.openid = res.data.openid
    }
  },
  /** 获取 openid */
  async wxAccount(ctx) {
    ctx.body = ctx.session.openid
  }
}