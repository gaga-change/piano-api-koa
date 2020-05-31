
import { Schema } from 'mongoose';
import {TEACHER_TYPE_DB_NAME} from "../config/dbName";
import Dict, {DictDocument} from "./Dict";

export interface TeacherTypeDocument extends DictDocument {
}

const schema = new Schema({

}, {
  timestamps: true,
  discriminatorKey: 'kind'
})

export default Dict.discriminator<TeacherTypeDocument>('TeacherType', schema, TEACHER_TYPE_DB_NAME)