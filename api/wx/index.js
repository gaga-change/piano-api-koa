const WxCache = require('../models/WxCache')
const code = require('../code')
const axios = require('axios')

const TEACHER_TYPE = 'teacher'
const STUDENT_TYPE = 'student'
function getAppidAndsecret(type) {
  if (type === TEACHER_TYPE) {
    return {
      appid: 'wxa2c0420dfeaf8d24',
      secret: '97c578ea751117d8c77fc63480cba424',
    }
  } else {
    return {
      appid: 'wx76bedc76c343e5a2',
      secret: '15ff5d3185b0e164339f8a0a4ea17049',
    }
  }
}

function isTeacher(type) {
  return type === TEACHER_TYPE
}
function isStudent(type) {
  return type === STUDENT_TYPE
}

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
    const { type } = ctx.params
    const { appid, secret } = getAppidAndsecret(type)
    if ((isTeacher(type) && ctx.session.teacherOpenid) ||
      (isStudent(type) && ctx.session.studentOpenid)
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
        ctx.session.studentOpenid = res.data.openid
      }
      ctx.body = {
        teacherOpenid: ctx.session.teacherOpenid,
        studentOpenid: ctx.session.studentOpenid,
      }
    }
  },
  /** 获取 openid */
  async wxAccount(ctx) {
    ctx.body = {
      teacherOpenid: ctx.session.teacherOpenid,
      studentOpenid: ctx.session.studentOpenid,
    }
  },
  /** 微信登录校验 */
  async teacherAuth(ctx, next) {
    ctx.assert(ctx.session.teacherOpenid, code.Unauthorized, "请在微信平台上操作")
    await next()
  },
  async studentAuth(ctx, next) {
    ctx.assert(ctx.session.studentOpenid, code.Unauthorized, "请在微信平台上操作")
    await next()
  },
}