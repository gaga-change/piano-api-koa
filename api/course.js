
const Course = require('./models/Course')
const Controller = require('./Controller')


class CourseController extends Controller {
  constructor(model) {
    super(model)
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