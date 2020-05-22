import Enums, {EnumsDocument} from "../models/Enums";
import Controller from "../tools/Controller";
import Application, {Context} from "koa";
import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../desc";
import {checkAdmin, checkAuth} from "../middleware/auth";
import * as localEnums from '../config/enums'

interface enums {
  [key: string]: Map<number, string>;
}

@RequestMapping('enums')
export class EnumsController extends Controller<EnumsDocument> {
  @Inject(Enums)
  Model: any

  @PostMapping('', [checkAuth, checkAdmin])
  async create(ctx: Application.Context): Promise<void> {
    await super.create(ctx);
  }

  @DeleteMapping(':id', [checkAuth, checkAdmin])
  async destroy(ctx: Application.Context): Promise<void> {
    await super.destroy(ctx);
  }

  @PutMapping(':id', [checkAuth, checkAdmin])
  async update(ctx: Application.Context): Promise<void> {
    await super.update(ctx);
  }

  /** 获取所有枚举 */
  @GetMapping('enumsTotal')
  async total(ctx: Context) {
    const turn = (str: string) => {
      str = str.toLowerCase()
      return str.replace(/_(\w)/g, (s: string, c: string) => {
        return c.toUpperCase()
      })
    }
    let locals = Object.keys(<enums>localEnums).map(key => {
      const map = (<enums>localEnums)[key]
      return {
        name: turn(key),
        keyValue: [...map.keys()].map((k) => ({value: k, name: map.get(k)}))
      }
    })
    ctx.body = [
      ...locals,
      ...await Enums.find({})
    ]
  }

  @GetMapping(':id',)
  async show(ctx: Application.Context): Promise<void> {
    await super.show(ctx);
  }

  @GetMapping('')
  async index(ctx: Application.Context): Promise<void> {
    await super.index(ctx);
  }
}