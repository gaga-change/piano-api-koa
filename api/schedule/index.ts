// 定时任务


import schedule from 'node-schedule';
import spaceAreaController from "../controller/spaceAreaController";

const scheduleControl = () => {
  schedule.scheduleJob('0 0 1 * * *', async () => {
    console.log('定时任务脚本...', new Date().toLocaleString())
    const res = await spaceAreaController.autoCreateService()
    console.log(`自动新增空闲时间数量：${res}`)
  });
}

export default scheduleControl