import Koa from 'koa'
import mongoose from 'mongoose'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import session from 'koa-session'
import  {PORT, MONGO_LINK} from './config'
import schedule from './schedule'
import api from './router'
import ThrowError from "./tools/ThrowError";
const app = new Koa()

setImmediate(schedule)
// MongoDB 连接
mongoose.connect(MONGO_LINK, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
const db = mongoose.connection

// Session 配置参数
const CONFIG = {
  httpOnly: true,
  key: 'koa:sess',
  maxAge: 86400000,
  overwrite: true,
  renew: false,
  rolling: false,
  signed: true
}

// Session 配置
app.keys = ['junn secret 4']
// MongoDB 连接异常输出
db.on('error', console.error.bind(console, 'connection error:'))
// Body 解析
app.use(bodyParser({ jsonLimit: '10kb' , enableTypes: ['json', 'form', 'xml']}))
// Session 解析
app.use(session(CONFIG, app))
// 日志信息输出
app.use(logger())
app.use(async (ctx, next) => {
  const header = ctx.request.header
  const host = header['x-forwarded-host']
  ctx.isTeacher = host && host.includes('teacher')
  ctx.openid = ctx.session.openid
  await next().catch(err => {
    if (err.name === 'ValidationError') {
      let megArr = Object.keys(err.errors).map(key => err.errors[key].message)
      return Promise.reject(new ThrowError(megArr.join(',')))
    } else {
      return Promise.reject(err)
    }
  })
})
// Api 接口
app.use(api)
// app.use(async (ctx) => {
//   ctx.body = '钢琴 - 接口'
// })
// 异常监听
app.on('error', (err: any) => {
  console.error(err)
})

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`)
})