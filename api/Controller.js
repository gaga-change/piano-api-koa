const code = require('./code')

class Controller {
  constructor(model) {
    this.Model = model
  }

  async create(ctx) {
    let item = ctx.request.body;

    item = new this.Model(item);
    ctx.body = await item.save()
  }

  async destroy(ctx) {
    const { id } = ctx.params;

    await this.Model.deleteOne({ _id: id })
  }

  async update(ctx) {
    const { id } = ctx.params;
    const item = ctx.request.body;
    const model = await this.Model.findById(id)
    ctx.assert(model, code.BadRequest, "数据已被删除！")
    await this.Model.update({ _id: id }, item)
  }

  async show(ctx) {
    const { id } = ctx.params;
    const model = await this.Model.findById(id)
    ctx.assert(model, code.BadRequest, "数据已被删除！")
    ctx.body = await this.Model.findById(id)
  }

  async index(ctx) {
    const query = ctx.query;
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const params = { ...query }
    delete params.pageSize
    delete params.pageNum
    const res1 = this.Model.find(params)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }
}

module.exports = Controller