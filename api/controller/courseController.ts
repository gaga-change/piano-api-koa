import {Model} from "mongoose";
import Controller from "../tools/Controller";
import SpaceArea from "../models/SpaceArea";
import {Context} from "koa";
import Course, {CourseDocument} from "../models/Course";
import * as mongoose from "mongoose";
import {initHour} from "../tools/dateTools";
import {NO_SPACE_AREA} from "../config/msg";
import ThrowError from "../tools/ThrowError";

class CourseController extends Controller<CourseDocument> {
  constructor(model: Model<CourseDocument>) {
    super(model)
  }

  async updateSpaceArea(item: CourseDocument, isTeacher: boolean, session?: any) {
    /*
新增课程后，对于的空闲时间 自动裁剪成两段（或一段 或无）
- 1. 查询对应的空闲时间。包含关系，只有一个。若无跳异常
- 2. 空闲开始 - (课程开始 - 1分钟)，（课程结束 + 1分钟） - 空闲结束
- 3. 拆成两段空闲时间，如果开始大于结束 则不创建
- 4. 删除旧的空闲时间
*/
    const opt  = session ? {session} : {}
    const { teacher, student } = item
    const params = { startTime: { $lte: item.startTime }, endTime: { $gte: item.endTime }, teacher, student}
    if (isTeacher) {
      delete params.student
    } else {
      delete params.teacher
    }
    let spaceArea = await SpaceArea.findOne(params, undefined, opt)
    if (!spaceArea) {
      throw new ThrowError(NO_SPACE_AREA)
    }
    if (teacher) {
      item.teacherSpaceRule = spaceArea.spaceRule
    } else {
      item.studentSpaceRule = spaceArea.spaceRule
    }
    {
      let newSpaceArea = new SpaceArea({ ...spaceArea.toObject(), _id: undefined })
      newSpaceArea.endTime = new Date(item.startTime.getTime() - 60 * 1000)
      console.log(newSpaceArea)
      if (newSpaceArea.endTime >= newSpaceArea.startTime) {
        await newSpaceArea.save(opt)
      }
    }
    {
      let newSpaceArea = new SpaceArea({ ...spaceArea.toObject(), _id: undefined })
      newSpaceArea.startTime = new Date(item.endTime.getTime() + 60 * 1000)
      if (newSpaceArea.endTime >= newSpaceArea.startTime) {
        await newSpaceArea.save(opt)
      }
    }
    await SpaceArea.deleteOne({ _id: spaceArea.id }, opt)
    // await spaceArea.remove()
  }
  async createService(body: any, session?:any) {
    let item = new this.Model(body)

    await this.updateSpaceArea(item, true , session)
    await this.updateSpaceArea(item, false, session)
    return await item.save({session})
  }

  /**
   * 获取当前周期内的 所有课程
   * @param ctx
   */
  async findActivateCourse(ctx: Context) {
    const {teacher, student} = ctx.query
    ctx.assert(teacher || student, 400, '参数异常')
    ctx.body = await Course.findByActivateArea({teacher, student})
  }

  /** 创建 */
  async create(ctx: Context) {
    const body = ctx.request.body
    ctx.body = await this.createService(body)
  }

  async destroyService(id: String, session?: any) {
    /*
     查找前后是否有相连的 空闲时间
     合并成一个
     删除前后空闲时间，以及 当前课程
   */
    const opt = session ? { session } : {}
    const course = await Course.findById(id, undefined, opt)
    if (!course) {
      throw Error('课程已被删除')
    }
    const run = async (obj: CourseDocument, isTeacher: boolean) => {
      const { teacher, student, startTime, endTime } = obj
      const person = isTeacher ? { teacher } : { student }
      const startSpace = await SpaceArea.findOne({
        ...person,
        endTime: new Date(startTime.getTime() - 60 * 1000),
      }, undefined, opt)
      const endSpace = await SpaceArea.findOne({
        ...person,
        startTime: new Date(endTime.getTime() + 60 * 1000),
      }, undefined, opt)
      let time = [startTime, endTime]
      if (startSpace) {
        time[0] = startSpace.startTime
        await SpaceArea.deleteOne({ _id: startSpace.id }, opt)
      }
      if (endSpace) {
        time[1] = endSpace.endTime
        // await endSpace.remove()
        await SpaceArea.deleteOne({ _id: endSpace.id }, opt)
      }
      const spaceArea = new SpaceArea({ ...person, startTime: time[0], endTime: time[1] })
      if (teacher) {
        spaceArea.spaceRule = obj.teacherSpaceRule
      } else {
        spaceArea.spaceRule = obj.studentSpaceRule
      }
      await spaceArea.save(opt)
    }
    await run({ ...course.toObject()}, true)
    await run({ ...course.toObject()}, false)
    await Course.deleteOne({ _id: course.id }, opt)
    // await course.remove()
  }

  /** 删除 */
  async destroy(ctx: Context) {
    const { id } = ctx.params;

    await this.destroyService(id)
    // await this.Model.deleteOne({ _id: id })
    ctx.body = null
  }

  /** 更新 */
  async update(ctx: Context) {
    const { id } = ctx.params;
    const item = ctx.request.body;
    const model = await this.Model.findById(id)
    if (!model) throw new ThrowError("数据已被删除")
    ctx.assert(item.startTime && item.endTime, 400, "请完善数据")
    if (model.startTime.getTime() === new Date(item.startTime).getTime()
      && model.endTime.getTime() === new Date(item.endTime).getTime()) {
      await this.Model.updateOne({ _id: id }, item)
    } else if (initHour(item.startTime) < initHour()) {
      // 昨天之前的课程，包括昨天
      await this.Model.updateOne({ _id: id }, item)
    } else {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        await this.destroyService(id, session)
        item._id = id
        await this.createService(item, session)
        await session.commitTransaction()
        session.endSession()
      } catch (error) {
        await session.abortTransaction();
        session.endSession()
        error.status = 400
        error.expose = true
        throw error
      }
    }
    ctx.body = null
  }


  async index(ctx: Context) {
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const params = { ...ctx.query }
    delete params.pageSize
    delete params.pageNum
    Object.keys(params).forEach(key => {
      if (this.Model.schema.obj[key].type === String) {
        params[key] = new RegExp(params[key], 'i')
      }
    })
    const res1 = Course.find(params)
      .sort(this.defaultSort)
      .limit(pageSize)
      .populate({ path: 'teacher', select: 'name' })
      .populate({ path: 'student', select: 'name' })
      .skip((page - 1) * pageSize)
    const res2 = this.Model.countDocuments(params)
    ctx.body = {
      total: await res2,
      list: await res1,
    }
  }
}

export default new CourseController(Course)