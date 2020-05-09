/**
 * 查找已被删除的子文档id 的aggregate查询条件
 * @param target
 * @param collectionName
 */
import {Document, Model} from "mongoose";
import {STUDENT_DB_NAME, TEACHER_DB_NAME} from "../config/dbName";

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
export const removeNoTeacherOrStudent = async (model: Model<Document>)  => {
    let idNum = 0;
    let docNum = 0;
    // 获取被删除的老师id
    const teacherIds =  await model.aggregate(findIdRemovedConfig('teacher', TEACHER_DB_NAME))
    idNum += teacherIds.length
    for(let i = 0; i < teacherIds.length; i ++) {
        const id = teacherIds[i]._id
        const res = await model.deleteMany({teacher: id})
        docNum += res.deletedCount
    }
    // 获取被删除的学生id
    const studentIds = await model.aggregate(findIdRemovedConfig('student', STUDENT_DB_NAME))
    idNum += studentIds.length
    for(let i= 0; i < studentIds.length; i ++) {
        const id = studentIds[i]._id
        const res = await model.deleteMany({student: id})
        docNum += res.deletedCount
    }
    return {
        idNum,
        docNum
    }
}