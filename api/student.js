
const Student = require('./models/Student')
const Controller = require('./Controller')
const { studentRegisterSuccess } = require('./wx/pushMsg')


class StudentController extends Controller {
  constructor(...args) {
    super(...args)
  }
  async update(ctx) {
    const { body } = ctx.request
    const { status } = body

    await super.update(ctx)
    console.log(body)
    if (status === 1) {
      studentRegisterSuccess(body)
    }
  }
}

module.exports = new StudentController(Student)