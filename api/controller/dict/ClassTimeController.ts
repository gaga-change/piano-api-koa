import Controller from "../../tools/Controller";
import ClassTime, {ClassTimeDocument} from "../../models/ClassTime";
import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../../desc";
import {Context} from "koa";
import {checkAuth} from "../../middleware/auth";
import {mongoSession} from "../../middleware/mongoSession";
import ThrowError from "../../tools/ThrowError";

@RequestMapping('classTimes')
export class ClassTimeController extends Controller<ClassTimeDocument>{

  @Inject(ClassTime)
  Model: any

  @Inject({ disabled: 1, createdAt: -1, })
  defaultSort: any

  @PostMapping("", [checkAuth, mongoSession])
  async create(ctx: Context): Promise<void> {
    // 校验时长是否重复
    let item = ctx.request.body;
    const {session} = ctx.state

    const classTime = new ClassTime(item);
    await classTime.save({session})
    classTime.time
    const findTimeLen = await ClassTime.find({time: classTime.time}, undefined, {session})
    if (findTimeLen.length > 1) {
      throw new ThrowError(`${classTime.time}分钟的配置已存在，请勿重复添加！`)
    }
    ctx.body = await item.save()
  }

  // @DeleteMapping(":id", [checkAuth])
  // async destroy(ctx: Context): Promise<void> {
  //   await super.destroy(ctx);
  // }

  @PutMapping(":id", [checkAuth])
  async update(ctx: Context): Promise<void> {
    // 不能修改时长
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