
const Course = require('./models/Course')
const SpaceArea = require('./models/SpaceArea')
const Controller = require('./Controller')
const code = require('./code')
const mongoose = require('mongoose')


class CourseController extends Controller {
  constructor(model) {
    super(model)
  }

  async createService(body, session) {
    /*
    新增课程后，对于的空闲时间 自动裁剪成两段（或一段 或无）
    - 1. 查询对应的空闲时间。包含关系，只有一个。若无跳异常
    - 2. 空闲开始 - (课程开始 - 1分钟)，（课程结束 + 1分钟） - 空闲结束
    - 3. 拆成两段空闲时间，如果开始大于结束 则不创建
    - 4. 删除旧的空闲时间
    */
    const opt = session ? { session } : {}
    let item = new this.Model(body)
    const updateSpaceArea = async ({ teacher, student }) => {
      const params = { startTime: { $lte: item.startTime }, endTime: { $gte: item.endTime } }
      if (teacher) {
        params.teacher = teacher
      } else {
        params.student = student
      }
      let spaceArea = await SpaceArea.findOne(params, undefined, opt)
      // ctx.assert(spaceArea, 400, '没有对应的空闲时间')
      if (!spaceArea) {
        const err = new Error('没有对应的空闲时间')
        err.status = 400
        err.expose = true
        throw err
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
    await updateSpaceArea({ teacher: item.teacher })
    await updateSpaceArea({ student: item.student })
    return await item.save(opt)
  }

  /** 创建 */
  async create(ctx) {
    const body = ctx.request.body
    ctx.body = await this.createService(body)
  }

  async destroyService(id, session) {
    /*
     查找前后是否有相连的 空闲时间
     合并成一个
     删除前后空闲时间，以及 当前课程
   */
    const opt = session ? { session } : {}
    const course = await Course.findById(id, undefined, opt)
    const run = async (obj) => {
      const { teacher, student, startTime, endTime, date } = obj
      const person = teacher ? { teacher } : { student }
      const startSpace = await SpaceArea.findOne({
        ...person,
        endTime: new Date(startTime.getTime() - 60 * 1000),
      },undefined, opt)
      const endSpace = await SpaceArea.findOne({
        ...person,
        startTime: new Date(endTime.getTime() + 60 * 1000),
      },undefined, opt)
      let time = [startTime, endTime]
      if (startSpace) {
        time[0] = startSpace.startTime
        await SpaceArea.deleteOne({ _id: startSpace.id }, opt)
        // await startSpace.remove()
      }
      if (endSpace) {
        time[1] = endSpace.endTime
        // await endSpace.remove()
        await SpaceArea.deleteOne({ _id: endSpace.id }, opt)
      }
      const spaceArea = new SpaceArea({ ...person, startTime: time[0], endTime: time[1], date })
      if (teacher) {
        spaceArea.spaceRule = obj.teacherSpaceRule
      } else {
        spaceArea.spaceRule = obj.studentSpaceRule
      }
      await spaceArea.save(opt)
    }
    await run({ ...course.toObject(), teacher: undefined })
    await run({ ...course.toObject(), student: undefined })
    await Course.deleteOne({ _id: course.id }, opt)
    // await course.remove()
  }

  /** 删除 */
  async destroy(ctx) {
    const { id } = ctx.params;

    await this.destroyService(id)
    // await this.Model.deleteOne({ _id: id })
    ctx.body = null
  }

  async updateService(oldData, newData) {
    const { id } = oldData
    await this.destroyService(id)

  }

  /** 更新 */
  async update(ctx) {
    const { id } = ctx.params;
    const item = ctx.request.body;
    const model = await this.Model.findById(id)
    ctx.assert(model, code.BadRequest, "数据已被删除！")
    ctx.assert(item.startTime && item.endTime, 400, "请完善数据")
    if (model.startTime.getTime() === new Date(item.startTime).getTime()
      && model.endTime.getTime() === new Date(item.endTime).getTime()) {
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
        const err = new Error(error.message)
        err.status = 400
        err.expose = true
        throw err
      }
    }
    ctx.body = null
  }


  async index(ctx) {
    const query = ctx.query;
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const params = { ...query }
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

module.exports = new CourseController(Course)