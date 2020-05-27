import {GetMapping, Inject, RequestMapping} from "../desc";
import {Context} from "koa";
import Controller from "../tools/Controller";
import Person, {PersonDocument} from "../models/Person";

@RequestMapping("persons")
export class PersonController extends Controller<PersonDocument>{
  @Inject(Person)
  Model:any

  @GetMapping("")
  async index(ctx: Context) {
    const query = ctx.query;
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const params = {$or: [{name: new RegExp(query.name, 'i')}, {phone: new RegExp(query.name)}]}
    delete query.pageSize
    delete query.pageNum
    delete query.name
    const res1 = this.Model.find({...params, ...query})
      .sort(this.defaultSort || { createdAt: -1 })
      .limit(pageSize)
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }

  @GetMapping(':id')
  async show(ctx: Context) {
    ctx.body = await Person.findById(ctx.params.id)
  }
}