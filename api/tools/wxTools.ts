import WxCacheToken from '../models/WxCacheToken'
import WxCacheTags from '../models/WxCacheTags'
import axios from 'axios'
import myAssert from "./myAssert";

export  const TEACHER_TYPE = 'teacher'
export  const STUDENT_TYPE = 'student'

export function getAppidAndsecret(type: string | boolean) {
  let isTeacher: boolean
  if (typeof type === "string") {
    isTeacher = type === TEACHER_TYPE
  } else {
    isTeacher = type
  }
  if (isTeacher) {
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

export function isTeacher(type: string) {
  return type === TEACHER_TYPE
}
export function isStudent(type: string) {
  return type === STUDENT_TYPE
}

export async function getToken(type: string): Promise<string> {

  let wxCacheToken = await WxCacheToken.findOne({ type })
  if (wxCacheToken === null) { // 若无，则建立
    wxCacheToken = new WxCacheToken({ type })
  }
  if (wxCacheToken.token && (Date.now() - wxCacheToken.updatedAt.getTime()) < 1000 * 60 * 100) {
    console.log("读取缓存 wxCacheToken - ")
  } else { // 超时
    console.log("token缓存失效或未读取，重新获取", new Date().toLocaleString())
    const { appid, secret } = getAppidAndsecret(type)
    const { data } = await axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`)
    myAssert(data.access_token, data.errmsg || '获取token报错', 500)
    wxCacheToken.token = data.access_token
    await wxCacheToken.save()
  }
  return wxCacheToken.token
}

async function getTags(type: string) {
  let wxCacheTags = await WxCacheTags.findOne({ type })
  const token = await getToken(type)
  if (wxCacheTags === null) { // 不存在则获取 保存
    const res = await axios.get(`https://api.weixin.qq.com/cgi-bin/tags/get?access_token=${token}`)
    wxCacheTags = new WxCacheTags({ type, tags: res.data })
    await wxCacheTags.save()
  }
  return wxCacheTags.tags
}

export  async function syncTags(type: string) {
  let wxCacheTags = await WxCacheTags.findOne({ type })
  const token = await getToken(type)
  const res = await axios.get(`https://api.weixin.qq.com/cgi-bin/tags/get?access_token=${token}`)
  const tags = res.data.tags
  if (wxCacheTags === null) {
    console.log('新建标签缓存')
    wxCacheTags = new WxCacheTags({ type, tags })
  } else {
    console.log('标签缓存更新')
    wxCacheTags.tags = tags
  }
  await wxCacheTags.save()
  return wxCacheTags.tags
}

async function getUserByTag(type: string, tagid: any) {
  const token = await getToken(type)
  const res = await axios.post(`https://api.weixin.qq.com/cgi-bin/user/tag/get?access_token=${token}`, { tagid })
  return res.data.data.openid
}

export async function getUserByTagName(type: string, tagName: string) {
  const tags = await getTags(type)
  const tag = tags.find((v: { name: string }) => v.name === tagName)
  if (!tag) {
    console.log('无此标签 ', tagName)
    return []
  } else {
    return await getUserByTag(type, tag.id)
  }
}
