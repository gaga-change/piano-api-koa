
import {Schema} from 'mongoose';
import Person, {PersonDocument} from "./Person";
import {STUDENT_DB_NAME} from "../config/dbName";

export interface StudentDocument extends PersonDocument{

}

const schema = new Schema({
  instrument: [{type: Number, }], // 学习的乐器
  instrumentStr: {type: String}, // 学习的乐器名称
  studyAge: {type: Number}, // 学琴年限
  age: {type: Number}, // 年龄
}, {
  timestamps: true,
  discriminatorKey: 'kind'
})

export default Person.discriminator<StudentDocument>('Student', schema, STUDENT_DB_NAME);