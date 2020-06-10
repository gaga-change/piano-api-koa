import Controller from "../tools/Controller";
import TakeCourse, {TakeCourseDocument} from "../models/TakeCourse";
import {GetMapping, Inject, PostMapping, PutMapping, RequestMapping} from "../desc";
import {Context} from "koa";
import {Model} from "mongoose";
import Teacher from "../models/Teacher";
import Student from "../models/Student";
import {teacherTakeCourse} from "./wx/pushMsg";

const pushMsg = (takeCouseId: String) => {
  setImmediate(async () => {
    // 消息推送
    const takeCourse = await TakeCourse.findById(takeCouseId).populate('classTime')
    const student = await Student.findById(takeCourse.student)
    const teacherTypes = takeCourse.teacherTypes
    if (teacherTypes && teacherTypes.length) {
      const teachers = await Teacher.find({type: {$in: teacherTypes}})
      console.log('消息推送 ', teachers.map(v => v.name))
      teachers.forEach((teacher) => {
        teacherTakeCourse(teacher, student, takeCourse)
      })
    }
  })
}

@RequestMapping("takeCourses")
export class TakeCourseController extends Controller<TakeCourseDocument> {

  @Inject(TakeCourse)
  Model:Model<TakeCourseDocument>

  @PostMapping("")
  async create(ctx: Context): Promise<void> {
    const model = new this.Model(ctx.request.body);
    ctx.body = await model.save()
    pushMsg(model._id)
  }

  // @DeleteMapping(":id")
  // async destroy(ctx: Context): Promise<void> {
  //   await super.destroy(ctx);
  // }

  @PutMapping(":id")
  async update(ctx: Context): Promise<void> {
    {
      const body = ctx.request.body
      if ( body.cancel === false) {
        pushMsg(ctx.params.id)
      }
    }
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