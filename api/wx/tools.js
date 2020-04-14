const WxCacheToken = require('../models/WxCacheToken')
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

async function getToken(type) {

  let wxCacheToken = await WxCacheToken.findOne({ type })
  if (wxCacheToken === null) { // 若无，则建立
    wxCacheToken = new WxCacheToken({ type })
  }
  if (wxCacheToken.token && (Date.now() - wxCacheToken.updatedAt.getTime()) < 1000 * 60 * 100) {
    console.log("读取缓存 wxCacheToken - ")
  } else { // 超时
    console.log("缓存失效或未读取，重新获取", new Date().toLocaleString())
    const { appid, secret } = getAppidAndsecret(type)
    const { data } = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`)
    const token = data.access_token
    console.log(token)
    wxCacheToken.token = token
    await wxCacheToken.save()
  }
  return wxCacheToken.token
}



module.exports = {
  isStudent,
  isTeacher,
  getAppidAndsecret,
  getToken,
  TEACHER_TYPE,
  STUDENT_TYPE
}