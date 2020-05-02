
const Course = require('./models/Course')
const SpaceArea = require('./models/SpaceArea')
const Controller = require('./Controller')


class CourseController extends Controller {
  constructor(model) {
    super(model)
  }
  
  async create(ctx) {
    /*
      新增课程后，对于的空闲时间 自动裁剪成两段（或一段 或无）
        - 1. 查询对应的空闲时间。包含关系，只有一个。若无跳异常
        - 2. 空闲开始 - (课程开始 - 1分钟)，（课程结束 + 1分钟） - 空闲结束
        - 3. 拆成两段空闲时间，如果开始大于结束 则不创建
        - 4. 删除旧的空闲时间
    */
    let item = ctx.request.body
    item = new this.Model(item)
    const updateSpaceArea = async ({ teacher, student }) => {
      const params = { startTime: { $lte: item.startTime }, endTime: { $gte: item.endTime } }
      if (teacher) {
        params.teacher = teacher
      } else {
        params.student = student
      }
      let spaceArea = await SpaceArea.findOne(params)
      ctx.assert(spaceArea, 400, '没有对应的空闲时间')
      {
        let newSpaceArea = new SpaceArea({ ...spaceArea.toObject(), _id: undefined })
        newSpaceArea.endTime = new Date(item.startTime.getTime() - 60 * 1000)
        console.log(newSpaceArea)
        if (newSpaceArea.endTime >= newSpaceArea.startTime) {
          await newSpaceArea.save()
        }
      }
      {
        let newSpaceArea = new SpaceArea({ ...spaceArea.toObject(), _id: undefined })
        newSpaceArea.startTime = new Date(item.endTime.getTime() + 60 * 1000)
        if (newSpaceArea.endTime >= newSpaceArea.startTime) {
          await newSpaceArea.save()
        }
      }
      await spaceArea.remove()
    }
    await updateSpaceArea({ teacher: item.teacher })
    await updateSpaceArea({ student: item.student })
    ctx.body = await item.save()
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