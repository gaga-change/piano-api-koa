const validNum = 7 // 按当天算起，最多排7天班

export const ONE_DAY_TIME = 24 * 60 * 60 * 1000 // 一天的毫秒数

/** 初始化时分秒，默认日期当天（时分秒为0的） */
export const initHour = (date?: string | Date | number ) : Date  => {
  let temp:Date;
  if (date) {
    temp = new Date(date)
  } else {
    temp = new Date()
  }
  temp.setHours(0, 0, 0, 0)
  return temp
}

/**
 * 拷贝年约日
 * @param target
 * @param date
 */
export const copyFullYears = (target: Date | string | number, date: Date) => {
  target = new Date(target)
  target.setFullYear(date.getFullYear(), date.getMonth(), date.getDate())
  return target
}

/** 返回所有有效日（默认当天开始），时分秒为0 */
export const validDays = (startDate?: string | Date | number): Array<Date> => {
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
  let res: Array<Date> = []
  while (startDate <= endDay) {
    res.push(startDate)
    startDate = new Date(startDate.getTime() + ONE_DAY_TIME)
  }
  return res
}

/** 指定规则开始时间， 返回所有有效期（当天算起） */
export const accordWithRule = (startDateRule: Date) : Array<Date> => {
  let res: Array<Date> = []
  const week = startDateRule.getDay()
  validDays().forEach((date: Date) => {
    if (date.getDay() === week) {
      res.push(date)
    }
  })
  return res
}

/** 返回有效时间范围，从当天开始，一直到最后一天的第二天, [start, end) */
export const getActivityArea = ():[Date, Date] => {
  const start = initHour()
  const end = new Date(start.getTime() + ONE_DAY_TIME * validNum)
  return [start, end]
}

/**
 * 时间已过期，非当天
 * @param time
 */
export const isOldDate = (time: Date|string) : boolean => {
  time = new Date(time)
  return time < initHour()
}