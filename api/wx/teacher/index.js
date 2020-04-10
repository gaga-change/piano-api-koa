const { Teacher } = require('../../models')


exports.register = async (ctx) => {
  const { body } = ctx.request
  body.status = 0 // 待审核
  let teacher = null
  if (body._id) {
    const _id = body._id
    teacher = await Teacher.findByIdAndUpdate(_id, body, { new: true })
  } else {
    teacher = new Teacher(body)
    await teacher.save()
  }
  ctx.body = teacher
}