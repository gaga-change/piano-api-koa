
const validNum = 7 // 按当天算起，最多排7天班

const ONE_DAY_TIME = 24 * 60 * 60 * 1000 // 一天的毫秒数
exports.ONE_DAY_TIME = ONE_DAY_TIME

/** 初始化时分秒，默认日期当天（时分秒为0的） */
const initHour = (date) => {
  if (date) {
    date = new Date(date)
  } else {
    date = new Date()
  }
  date.setHours(0, 0, 0, 0)
  return date
}
exports.initHour = initHour


/** 拷贝时分 到另一个时间， 默认 秒和毫秒为0, 不改变目标本身 */
const copyHour = (target, date)  => {
  target = new Date(target)
  let hour = date.getHours()
  let min = date.getMinutes()
  target.setHours(hour)
  target.setMinutes(min)
  return target
}
exports.copyHour = copyHour

/** 返回所有有效日（默认当天开始），时分秒为0 */
exports.validDays = (startDate) => {
  let today = initHour(new Date())
  if (!startDate) {
    startDate = today
  } else {
    startDate = initHour(startDate)
  }
  if (startDate < today) { // 比当前时间小的忽略
    startDate = today
  }
  let endDay = new Date(today.getTime() + ONE_DAY_TIME * (validNum - 1))
  let res = []
  while (startDate <= endDay) {
    res.push(startDate)
    startDate = new Date(startDate.getTime() + ONE_DAY_TIME)
  }
  return res
}

/** 指定规则开始时间， 返回所有有效期（当天算起） */
exports.accordWithRule = (startDateRule) => {
  let res = []
  const week = startDateRule.getDay()
  exports.validDays().forEach(date => {
    if (date.getDay() === week) {
      res.push(date)
    }
  })
  return res
}
