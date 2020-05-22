
import {Schema} from 'mongoose';
import Person, {PersonDocument} from "./Person";

export interface StudentDocument extends PersonDocument{

}

const schema = new Schema({
  instrument: [{type: Number, }] // 学习的乐器
}, {
  timestamps: true,
  discriminatorKey: 'kind'
})

export default Person.discriminator<StudentDocument>('Student', schema, 'student');