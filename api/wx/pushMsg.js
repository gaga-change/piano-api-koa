const axios = require('axios')
const { getToken, TEACHER_TYPE, STUDENT_TYPE } = require('./tools')

exports.teacherRegisterSuccess = async (teacher) => {
  const token = await getToken(TEACHER_TYPE)
  axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
    "touser": teacher.openid,
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
      },
      "remark": {
        "value": "去设置您的空闲时间段吧"
      },
      
    }
  })
}

exports.studentRegisterSuccess = async (student) => {
  const token = await getToken(STUDENT_TYPE)
  axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
    "touser": student.openid,
    "template_id": "blQsIsRXXa4V8bltStYNPQZBo-tXqDpsMNRDcvH0mlI",
    "url": "http://static.local.shop.csj361.com/teacher/teacherRegister",
    "data": {
      "first": {
        "value": "恭喜您成为Carry陪练的会员！"
      },
      "keyword1": {
        "value": student.name
      },
      "keyword2": {
        "value": student.phone
      },
      "remark": {
        "value": "去设置您的空闲时间段吧"
      },
    }
  }).then(res => {
    console.log(res.data)
  })
}