import Person, {PersonDocument} from "./Person";

import {Schema} from 'mongoose';
import {TEACHER_DB_NAME} from "../config/dbName";
import {ClassTimeDocument} from "./ClassTime";

export interface TeacherDocument extends PersonDocument {
  school?: string
  major?: string
  grade?: number
  type?: Schema.Types.ObjectId | ClassTimeDocument | string
}

const schema = new Schema({
  school: {type: String, trim: true}, // 学校
  major: {type: String, trim: true}, // 专业
  type: {type: Schema.Types.ObjectId, ref: 'TeacherType'}, // 类型
}, {
  timestamps: true,
  discriminatorKey: 'kind'
})

export default Person.discriminator<TeacherDocument>('Teacher', schema, TEACHER_DB_NAME)