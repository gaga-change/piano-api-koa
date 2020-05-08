// 定时任务


const schedule = require('node-schedule');
const spaceAreaController = require('../spaceArea')

const scheduleCronstyle = () => {
  schedule.scheduleJob('0 0 1 * * *', async () => {
    console.log('定时任务脚本...', new Date().toLocaleString())
    console.log('scheduleCronstyle:' + new Date());
    const res = await spaceAreaController.autoCreateService()
    console.log(`自动新增空闲时间数量：${res}`)
  });
}

module.exports = scheduleCronstyle