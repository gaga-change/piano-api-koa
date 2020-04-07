class Controller {
  constructor(model) {
    this.Model = model
  }

  success(ctx, data) {
    ctx.body = {
      code: 200,
      data,
    }
  }

  error(ctx, errMsg) {
    ctx.body = {
      errMsg
    }
  }


  async create(ctx) {
    let item = ctx.request.body;

    item = new this.Model(item);
    this.success(ctx, await item.save())
  }

  async destroy(ctx) {
    const { id } = ctx.params;

    await this.Model.deleteOne({ _id: id })
    this.success(ctx)
  }

  async update(ctx) {
    const { id } = ctx.params;
    const item = ctx.request.body;
    const model = await this.Model.findById(id)
    if (model) {
      await this.Model.update({ _id: id }, item)
      this.success(ctx)
    } else {
      this.error(ctx, "数据已被删除！")
    }
  }

  async show(ctx) {
    const { id } = ctx.params;
    const model = await this.Model.findById(id)
    if (model) {
      this.success(ctx, await this.Model.findById(id))
    } else {
      this.error(ctx, "数据已被删除！")
    }
  }

  async index(ctx) {
    console.log(this, this.Model, '----')
    const query = ctx.query;
    const pageSize = Number(ctx.query.pageSize) || 20;
    const page = Number(ctx.query.pageNum) || 1;
    const params = { ...query };
    delete params.pageSize;
    delete params.pageNum;
    const list = await this.Model.find(params)
      .sort({ createdAt: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize);
    this.success(ctx, {
      total: await this.Model.countDocuments(params),
      list,
    })
  }

}

module.exports = Controller