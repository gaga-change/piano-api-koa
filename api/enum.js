
const Enums = require('./models/Enum')
const Controller = require('./Controller')

const enumController = new Controller(Enums)

/** 获取所有枚举 */
enumController.total = async ctx => {
  ctx.body = await Enums.find({})
}

module.exports = enumController