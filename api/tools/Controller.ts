import {Document, Model} from "mongoose";
import {Context} from "koa";

import code from '../config/code';

// @PostMapping("")
// async create(ctx: Context): Promise<void> {
//   await super.create(ctx);
// }
//
// @DeleteMapping(":id")
// async destroy(ctx: Context): Promise<void> {
//   await super.destroy(ctx);
// }
//
// @PutMapping(":id")
// async update(ctx: Context): Promise<void> {
//   await super.update(ctx);
// }
//
// @GetMapping(":id")
// async show(ctx: Context): Promise<void> {
//   await super.show(ctx);
// }
//
// @GetMapping("")
// async index(ctx: Context): Promise<void> {
//   await super.index(ctx);
// }

interface Options {
  defaultSort?: Object
}

class Controller<T extends Document> {
  protected readonly Model: Model<T>;
  protected readonly defaultSort: string | any;

  constructor(model: Model<T>, options?: Options) {
    this.Model = model
    options = options || {}
    this.defaultSort = options.defaultSort || { createdAt: -1 }
  }

  async create(ctx: Context) {
    const model = new this.Model(ctx.request.body);
    ctx.body = await model.save()
  }

  async destroy(ctx: Context) {
    const { id } = ctx.params;

    await this.Model.deleteOne({ _id: id })
    ctx.body = null
  }

  async update(ctx: Context) {
    const { id } = ctx.params;
    const item = ctx.request.body;
    const model = await this.Model.findById(id)
    ctx.assert(model, code.BadRequest, "数据已被删除！")
    await this.Model.updateOne({ _id: id }, item)
    ctx.body = null
  }

  async show(ctx: Context) {
    const { id } = ctx.params;
    const model = await this.Model.findById(id)
    ctx.assert(model, code.BadRequest, "数据已被删除！")
    ctx.body = model
  }

  async index(ctx: Context) {
    const query = ctx.query;
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const params = { ...query }
    delete params.pageSize
    delete params.pageNum
    Object.keys(params).forEach(key => {
      if (this.Model.schema.obj[key] && this.Model.schema.obj[key].type === String) {
        params[key] = new RegExp(params[key], 'i')
      }
    })
    const res1 = this.Model.find(params)
      .sort(this.defaultSort || { createdAt: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }
}

export  default  Controller
