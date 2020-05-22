
import { Schema} from 'mongoose';
import Person, {PersonDocument} from "./Person";


export interface TeacherDocument extends PersonDocument {
  school?: string
  major?: string
  grade?: number
  type?: number
}

const schema = new Schema({
  school: { type: String, trim: true }, // 学校
  major : { type: String, trim: true }, // 专业
  grade : { type: Number,  }, // 等级
  type : { type: Number,  }, // 类型
}, {
  timestamps: true,
  discriminatorKey: 'kind'
})

export default Person.discriminator<TeacherDocument>('Teacher', schema, 'teacher')