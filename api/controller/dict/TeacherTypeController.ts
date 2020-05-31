import Controller from "../../tools/Controller";
import {ClassTypeDocument} from "../../models/ClassType";
import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../../desc";
import {Context} from "koa";
import {checkAuth} from "../../middleware/auth";
import TeacherType from "../../models/TeacherType";

@RequestMapping('teacherTypes')
export class TeacherTypeController extends Controller<ClassTypeDocument>{

  @Inject(TeacherType)
  Model: any

  @Inject({ disabled: 1, createdAt: -1, })
  defaultSort: any

  @PostMapping("", [checkAuth])
  async create(ctx: Context): Promise<void> {
    await super.create(ctx);
  }

  // @DeleteMapping(":id", [checkAuth])
  // async destroy(ctx: Context): Promise<void> {
  //   await super.destroy(ctx);
  // }

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