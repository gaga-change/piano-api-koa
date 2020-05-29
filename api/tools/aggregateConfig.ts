/**
 * 查找已被删除的子文档id 的aggregate查询条件
 * @param target
 * @param collectionName
 */
import {Document, Model} from "mongoose";
import {STUDENT_DB_NAME, TEACHER_DB_NAME} from "../config/dbName";
import ThrowError from "./ThrowError";
import {getActivityArea} from "./dateTools";
import {StudentDocument, TeacherDocument} from "../models";

export const findIdRemovedConfig = (target: String, collectionName: String) => {

  const match: {} = {
    $match: {
      _id: {$ne: null}
    }
  }
  return [
    {
      $lookup: {
        from: collectionName,
        localField: target,
        foreignField: "_id",
        as: "objs"
      }
    },
    {
      $match: {
        objs: {$size: 0}
      }
    },
    {
      $group: {
        _id: `$${target}`
      },
    },
    match
  ]
}

/**
 * 删除没有绑定 主文档
 * @param model
 */
export const removeNoTeacherOrStudent = async (model: Model<Document>) => {
  let idNum = 0;
  let docNum = 0;
  // 获取被删除的老师id
  const teacherIds = await model.aggregate(findIdRemovedConfig('teacher', TEACHER_DB_NAME))
  idNum += teacherIds.length
  for (let i = 0; i < teacherIds.length; i++) {
    const id = teacherIds[i]._id
    const res = await model.deleteMany({teacher: id})
    docNum += res.deletedCount
  }
  // 获取被删除的学生id
  const studentIds = await model.aggregate(findIdRemovedConfig('student', STUDENT_DB_NAME))
  idNum += studentIds.length
  for (let i = 0; i < studentIds.length; i++) {
    const id = studentIds[i]._id
    const res = await model.deleteMany({student: id})
    docNum += res.deletedCount
  }
  return {
    idNum,
    docNum
  }
}

export interface FindByActivateAreaOptions {
  teacher?: string | TeacherDocument
  student?: string | StudentDocument
}

/**
 * 获取有效时间范围内的文档
 * @param model
 * @param options
 * @param appendQuery
 */
export const findByActivateArea = async (model: Model<Document>, options: FindByActivateAreaOptions, appendQuery: any = {}) => {
  const {teacher, student} = options
  if (!teacher && !student) {
    throw new ThrowError("参数有误")
  }
  const isTeacher = !!teacher
  const [startDate, endDate] = getActivityArea()
  if (isTeacher) {
    return model.find({startTime: {$gte: startDate, $lt: endDate}, teacher, ...appendQuery}).sort("startTime").populate('student').populate('teacher')
  } else {
    return model.find({startTime: {$gte: startDate, $lt: endDate}, student, ...appendQuery}).sort("startTime").populate('student').populate('teacher')
  }
}