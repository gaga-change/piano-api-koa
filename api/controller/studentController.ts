import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../desc";

import Application from "koa";
import Controller from '../tools/Controller';
import SpaceRule from "../models/SpaceRule";
import Student from '../models/Student';
import {StudentDocument} from "../models";
import {checkAuth} from "../middleware/auth";
import {studentRegisterSuccess} from "./wx/pushMsg";

@RequestMapping('students')
export class StudentController extends Controller<StudentDocument> {

  @Inject(Student)
  Model:any

  @PostMapping('', [checkAuth])
  async create(ctx: Application.Context): Promise<void> {
    await super.create(ctx);
  }

  @DeleteMapping(':id', [checkAuth])
  async destroy(ctx: Application.Context): Promise<void> {
    const id:string = ctx.params.id
    await super.destroy(ctx);

    setImmediate(async () => {
      // 删除 规则
      await SpaceRule.deleteMany({person: id})
    })
  }

  @PutMapping(':id', [checkAuth])
  async update(ctx: Application.Context): Promise<void> {
    const { body } = ctx.request
    const { status } = body
    const { id } = ctx.params
    const oldStudent = await Student.findById(id)
    await super.update(ctx)
    if (status === 1 && oldStudent && oldStudent.status !== 1) {
      // 通知学生注册成功
      await studentRegisterSuccess(body)
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