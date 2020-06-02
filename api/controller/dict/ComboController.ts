import Controller from "../../tools/Controller";
import {GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../../desc";
import {Context} from "koa";
import {checkAuth} from "../../middleware/auth";
import Combo from "../../models/Combo";
import {ComboDocument} from "../../models/Combo";

@RequestMapping('combos')
export class ComboController extends Controller<ComboDocument>{

  @Inject(Combo)
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