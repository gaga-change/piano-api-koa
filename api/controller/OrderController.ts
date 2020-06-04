import Controller from "../tools/Controller";
import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping} from "../desc";
import {Context} from "koa";
import Order, {OrderDocument} from "../models/Order";
import code from "../config/code";
import _ from "lodash";
import Product from "../models/Product";


@GetMapping("orders")
export class OrderController extends Controller<OrderDocument> {
  @Inject(Order)
  Model: any

  @PostMapping("")
  async create(ctx: Context): Promise<void> {
    let order = new Order(ctx.request.body)
    const product = await Product.findById(order.product)
    order.excessTime = product && product.totalTime // 剩余时间 初始 等于商品的总时间
    ctx.body = await order.save()
  }

  @DeleteMapping(":id")
  async destroy(ctx: Context): Promise<void> {
    await super.destroy(ctx);
  }

  @PutMapping(":id")
  async update(ctx: Context): Promise<void> {
    const { id } = ctx.params;
    const item =  _.omit(ctx.request.body, ['excessTime'])
    const model = await this.Model.findById(id)
    ctx.assert(model, code.BadRequest, "数据已被删除！")
    await this.Model.updateOne({ _id: id }, item)
    ctx.body = null
  }

  @GetMapping(":id")
  async show(ctx: Context): Promise<void> {
    await super.show(ctx);
  }

  @GetMapping("")
  async index(ctx: Context): Promise<void> {
    await super.index(ctx);
  }
}