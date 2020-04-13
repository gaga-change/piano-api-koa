const axios = require('axios')
const { getToken, TEACHER_TYPE } = require('./tools')

exports.teacherRegisterSuccess = async (teacher) => {
  const token = await getToken(TEACHER_TYPE)
  axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
    "touser": "o8yaSjpV8rs2XeGHvT-FwoCWz5Uw",
    "template_id": "P2InMFm7yqOiij-9Rmzt7Qdg3FiUcwbaF3tTHu5qL-o",
    "url": "http://static.local.shop.csj361.com/teacher/teacherRegister",
    "topcolor": "#FF0000",
    "data": {
      "first": {
        "value": "恭喜您成为四分音艺术教师的一员！"
      },
      "keyword1": {
        "value": teacher.name
      },
      "keyword2": {
        "value": teacher.phone
      }
    }
  })
}