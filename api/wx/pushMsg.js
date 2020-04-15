const axios = require('axios')
const { getToken, TEACHER_TYPE, STUDENT_TYPE, getUserByTagName } = require('./tools')

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
        "value": "发送消息【空闲时段】，设置您的空闲时间段"
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
        "value": "发送消息【空闲时段】，设置您孩子的空闲时间段"
      },
    }
  }).then(res => {
    console.log(res.data)
  })
}

exports.informTeacherRegister = async (teacher) =>  {
  const openids = await getUserByTagName('teacher', '消息推送')
  const token = await getToken(TEACHER_TYPE)
  openids.forEach(openid => {
    axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
      "touser": openid,
      "template_id": "yMD7XbC7p4ODXzJ605lL3oZhKICAskFSalrCbNanKGo",
      "url": "",
      "topcolor": "#FF0000",
      "data": {
        "first": {
          "value": "有新的注册信息，请及时受理"
        },
        "keyword1": {
          "value": teacher.name
        },
        "keyword2": {
          "value": teacher.phone
        },
        "remark": {
          "value": "请到后台管理中审批"
        },
      }
    })
  })

}