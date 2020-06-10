import Controller from "../tools/Controller";
import TakeCourse, {TakeCourseDocument} from "../models/TakeCourse";
import {GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../desc";
import {Context} from "koa";
import {Model} from "mongoose";


@RequestMapping("takeCourses")
export class TakeCourseController extends Controller<TakeCourseDocument> {

  @Inject(TakeCourse)
  Model:Model<TakeCourseDocument>

  @PostMapping("")
  async create(ctx: Context): Promise<void> {
    await super.create(ctx);
  }

  // @DeleteMapping(":id")
  // async destroy(ctx: Context): Promise<void> {
  //   await super.destroy(ctx);
  // }

  @PutMapping(":id")
  async update(ctx: Context): Promise<void> {
    await super.update(ctx);
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
      .sort(this.defaultSort || { createdAt: -1 })
      .populate('teacher')
      .populate('student')
      .populate('course')
      .populate('classType')
      .populate('classTime')
      .populate({path: 'order', populate: "product"})
      .limit(pageSize)
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }
}