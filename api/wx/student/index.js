const { Student } = require('../../models')


exports.register = async (ctx) => {
  const { body } = ctx.request
  body.status = 0 // 待审核
  let student = null
  if (body._id) {
    const _id = body._id
    student = await Student.findByIdAndUpdate(_id, body, { new: true })
  } else {
    student = new Student(body)
    await student.save()
  }
  ctx.body = student
}