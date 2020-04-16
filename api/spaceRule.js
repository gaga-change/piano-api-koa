
const SpaceRule = require('./models/SpaceRule')
const Controller = require('./Controller')
const SpaceArea = require('./models/SpaceArea')


const getDateAreasByRule = (t, week, space) => {
  let date = new Date(t)
  let hour = date.getHours()
  let min = date.getMinutes()
  const res = []
  const nowDate = new Date()
  const nowWeek = nowDate.getDay()
  const tempDays = week - nowWeek
  const oneDayTime = 24 * 60 * 60 * 1000
  const addTime = (tempDays > 0 ? tempDays : (7 + tempDays)) * oneDayTime
  const startTime = new Date(nowDate.getTime() + addTime)
  startTime.setHours(hour, min, 0, 0)
  res.push({
    startTime,
    endTime: new Date(startTime.getTime() + space)
  })
  if (tempDays === 0) {
    let temp = new Date()
    temp.setHours(hour, min, 0, 0)
    res.push({
      startTime: temp,
      endTime: new Date(temp.getTime() + space)
    })
  }
  return res
}

/** 自动新增空闲时间（当天 & 后7天） */
const setSpaceArea = async spaceRule => {
  /*
    当天是周几 nowWeek
    week - nowWeek
      if > 0
        当天+【差的天数】天  设置时分
      if < 0
        当天 + 7 - 【差的天数】天  设置时分
  */
  const { startTime, endTime, week, teacher, student } = spaceRule
  getDateAreasByRule(startTime, week, endTime - startTime).forEach(item => {
    let date = new Date(item.startTime)
    date.setHours(0,0,0,0)
    const spaceArea = new SpaceArea({ teacher, student, spaceRule, date, ...item })
    spaceArea.save()
  })
}
const delSpaceArea = async id => {
  let res = await SpaceArea.deleteMany({ spaceRule: id })
  console.log(res)
}
class SpaceRuleController extends Controller {
  constructor(model) {
    super(model, { defaultSort: { startTime: 1 } })
  }

  async create(ctx) {
    let item = ctx.request.body;

    item = new this.Model(item);
    ctx.body = await item.save()
    setSpaceArea(item)
  }

  async destroy(ctx) {
    const { id } = ctx.params;

    await this.Model.deleteOne({ _id: id })
    delSpaceArea(id)
    ctx.body = null
  }
}

module.exports = new SpaceRuleController(SpaceRule)