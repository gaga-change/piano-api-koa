import Controller from "../tools/Controller";
import {GetMapping, Inject, PostMapping, PutMapping} from "../desc";
import {Context} from "koa";
import Order, {OrderDocument} from "../models/Order";
import code from "../config/code";
import _ from "lodash";
import Product from "../models/Product";
import {checkAuth} from "../middleware/auth";


@GetMapping("orders")
export class OrderController extends Controller<OrderDocument> {
  @Inject(Order)
  Model: any

  @PostMapping("", [checkAuth,])
  async create(ctx: Context): Promise<void> {
    let order = new Order(ctx.request.body)
    const product = await Product.findById(order.product)
    order.excessTime = product && product.time // 剩余时间 初始 等于商品的总时间
    ctx.body = await order.save()
  }

  // @DeleteMapping(":id")
  // async destroy(ctx: Context): Promise<void> {
  //   await super.destroy(ctx);
  // }

  @PutMapping(":id", [checkAuth,])
  async update(ctx: Context): Promise<void> {
    const {id} = ctx.params;
    const item = _.omit(ctx.request.body, ['excessTime', 'product', 'student']) // 剩余时间、课程、学生不允许修改
    const model = await this.Model.findById(id)
    ctx.assert(model, code.BadRequest, "数据已被删除！")
    await this.Model.updateOne({_id: id}, item)
    ctx.body = null
  }

  @GetMapping(":id")
  async show(ctx: Context): Promise<void> {
    await super.show(ctx);
  }

  @GetMapping("")
  async index(ctx: Context): Promise<void> {
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
      .populate('product')
      .populate('student')
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