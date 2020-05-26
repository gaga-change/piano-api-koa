import LeaveArea, {LeaveAreaDocument} from "../models/LeaveArea";
import Controller from "../tools/Controller";
import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../desc";
import {Context} from "koa";
import {checkAuth} from "../middleware/auth";
import {mongoSession} from "../middleware/mongoSession";


@RequestMapping("leaveAreas")
export class LeaveAreaController extends Controller<LeaveAreaDocument>{

  @Inject(LeaveArea)
  Model:any

  @PostMapping("", [checkAuth, mongoSession])
  async create(ctx: Context): Promise<void> {
    let item = ctx.request.body;

    item = new this.Model(item);
    ctx.body = await item.save()
  }

  @DeleteMapping(":id", [checkAuth])
  async destroy(ctx: Context): Promise<void> {
     await super.destroy(ctx);
  }

  @PutMapping(":id", [checkAuth])
  async update(ctx: Context): Promise<void> {
     await super.update(ctx);
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