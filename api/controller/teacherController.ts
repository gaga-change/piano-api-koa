import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../desc";
import Teacher, {TeacherDocument} from '../models/Teacher';
import {checkAdmin, checkAuth} from "../middleware/auth";

import Application from "koa";
import Controller from '../tools/Controller';
import SpaceRule from "../models/SpaceRule";
import {teacherRegisterSuccess} from "./wx/pushMsg";

@RequestMapping('teachers')
export class TeacherController extends Controller<TeacherDocument> {

  @Inject(Teacher)
  Model:any

  @PostMapping('', [checkAuth, checkAdmin])
  async create(ctx: Application.Context): Promise<void> {
    await super.create(ctx);
  }

  @DeleteMapping(':id', [checkAuth, checkAdmin])
  async destroy(ctx: Application.Context): Promise<void> {
    const id:string = ctx.params.id
    await super.destroy(ctx);
    setImmediate(async () => {
      // 删除 规则以及空闲时间
      await SpaceRule.deleteMany({teacher: id})
    })
  }

  @PutMapping(':id', [checkAuth, checkAdmin])
  async update(ctx: Application.Context): Promise<void> {
    const test = new Teacher()
    test.name;
    const { body } = ctx.request
    const { status } = body
    const {id} = ctx.params
    const oldTeacher = await Teacher.findById(id)
    await super.update(ctx)

    if (status === 1 && oldTeacher && oldTeacher.status !== 1) {
      setImmediate(async () => {
        await teacherRegisterSuccess(body)
      })
    }
  }

  @GetMapping(':id', )
  async show(ctx: Application.Context): Promise<void> {
    await super.show(ctx);
  }

  @GetMapping('')
  async index(ctx: Application.Context): Promise<void> {
    await super.index(ctx);
  }
}

export  default  new TeacherController(Teacher)