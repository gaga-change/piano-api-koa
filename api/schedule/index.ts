// 定时任务

import NodeModel from "../models/NodeModel"
import schedule from 'node-schedule'

const {HOSTNAME} = process.env

const scheduleControl = async () => {
  if (HOSTNAME) {
    schedule.scheduleJob('0 30 0 * * *', async () => {
      // 清理节点
      await NodeModel.deleteMany({})
      console.log('清理节点', new Date().toLocaleString())
    })

    schedule.scheduleJob('0 31 0 * * *', async () => {
      // 创建节点
      await NodeModel.create({name: HOSTNAME})
      console.log('创建节点', new Date().toLocaleString())
    })

    schedule.scheduleJob('0 0 1 * * *', async () => {
      // 查询最新创建的节点，最新创建的节点有权执行定时任务
      const nodeModule = await NodeModel.findOne().sort("-_id")
      if (nodeModule && nodeModule.name && nodeModule.name === HOSTNAME) {
        console.log('定时任务脚本...', new Date().toLocaleString())
      } else {
        console.log('不执行定时任务')
      }
    })
  }
}

export default scheduleControl