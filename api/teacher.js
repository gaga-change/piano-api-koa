
const Teacher = require('./models/Teacher')
const Controller = require('./Controller')
const { teacherRegisterSuccess } = require('./wx/pushMsg')

class TeacherController extends Controller {
  constructor(model) {
    super(model)
  }
  async update(ctx) {
    const { body } = ctx.request
    const { status } = body

    await super.update(ctx)
    console.log(body)
    if (status === 1) {
      teacherRegisterSuccess(body)
    }
  }
}

module.exports = new TeacherController(Teacher) 