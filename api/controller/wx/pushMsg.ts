import {TeacherDocument, StudentDocument} from "../../models";
import {AxiosResponse} from "axios";
import moment from 'moment'
import axios from 'axios';
import { getToken, TEACHER_TYPE, STUDENT_TYPE, getUserByTagName } from '../../tools/wxTools'
import {TakeCourseDocument} from "../../models/TakeCourse";

/**
 * 通知老师抢课
 * @param teacher
 * @param student
 * @param takeCourse
 */
export const teacherTakeCourse = async (teacher: TeacherDocument, student: StudentDocument, takeCourse: TakeCourseDocument) => {
  const token = await getToken(TEACHER_TYPE)
  const classTime: any = takeCourse.classTime
  await axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
    "touser": teacher.openid,
    "template_id": "DVy-G8MPZtlZkToOeZFcsX6DmM0pjEUNMR-iBKT7RfA",
    "url": `http://page.teacher.wx.carry.junn.top/teacher/TakeCourse?id=${takeCourse._id}`,
    "data": {
      "first": {
        "value": "抢课通知！"
      },
      "keyword1": {
        "value": "抢课通知"
      },
      "keyword2": {
        "value": `开始时间：${moment(takeCourse.startTime).format("YYYY-MM-DD HH:mm")}，课时：${classTime.time}分钟，学生：${student.name}`
      },
      "remark": {
        "value": "点击进入抢课页面！"
      },

    }
  })
}

/**
 * 老师注册成功通知
 * @param teacher
 */
export const teacherRegisterSuccess = async (teacher: TeacherDocument) => {
  const token = await getToken(TEACHER_TYPE)
  await axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
    "touser": teacher.openid,
    "template_id": "P2InMFm7yqOiij-9Rmzt7Qdg3FiUcwbaF3tTHu5qL-o",
    // "url": "http://page.teacher.carry.junn.top/teacher/teacherRegister",
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

/**
 * 学生注册成功通知
 * @param student
 */
export const studentRegisterSuccess = async (student: StudentDocument) => {
  const token = await getToken(STUDENT_TYPE)
  axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
    "touser": student.openid,
    "template_id": "blQsIsRXXa4V8bltStYNPQZBo-tXqDpsMNRDcvH0mlI",
    // "url": "http://page.student.carry.junn.top/teacher/teacherRegister",
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
  }).then((res: AxiosResponse) => {
    console.log(res.data)
  })
}

/** 通知管理员 教师资料提交 */
export const informTeacherRegister = async (teacher: TeacherDocument) =>  {
  const openids = await getUserByTagName(TEACHER_TYPE, '消息推送')
  const token = await getToken(TEACHER_TYPE)
  openids.forEach((openid : string) => {
    axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
      "touser": openid,
      "template_id": "yMD7XbC7p4ODXzJ605lL3oZhKICAskFSalrCbNanKGo",
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

/** 通知管理员学生资料提交 */
export const informStudentRegister = async (student: StudentDocument) =>  {
  const openids = await getUserByTagName(STUDENT_TYPE, '消息推送')
  const token = await getToken(STUDENT_TYPE)
  openids.forEach((openid: string) => {
    axios.post(`https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${token}`, {
      "touser": openid,
      "template_id": "l5w82zR0G7PyMz5NY0fKn0Lz6nRJdv3kpZedJnSJYeQ",
      "topcolor": "#FF0000",
      "data": {
        "first": {
          "value": "有新的注册信息，请及时受理"
        },
        "keyword1": {
          "value": `学生信息: ${student.name}-${student.phone}`
        },
        "keyword2": {
          "value": '待审核'
        },
        "remark": {
          "value": "请到后台管理中审批"
        },
      }
    })
  })
}