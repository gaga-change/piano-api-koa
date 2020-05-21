import Application from "koa";
import {StudentDocument} from "../models";
import Student from '../models/Student';
import Controller from '../tools/Controller';
import {studentRegisterSuccess} from "./wx/pushMsg";
import SpaceRule from "../models/SpaceRule";
import SpaceArea from "../models/SpaceArea";
import {DeleteMapping, GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../desc";
import {checkAuth} from "../middleware/auth";

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
      // 删除 规则以及空闲时间
      await SpaceRule.deleteMany({student: id})
      await SpaceArea.deleteMany({student: id})
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