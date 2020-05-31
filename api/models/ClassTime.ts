
import { Schema } from 'mongoose';
import {CLASS_TIME_DB_NAME} from "../config/dbName";
import Dict, {DictDocument} from "./Dict";

export interface ClassTimeDocument extends DictDocument {
  time: number
}

const schema = new Schema({
  time: {type: Number, required: true}
}, {
  timestamps: true,
  discriminatorKey: 'kind'
})

export default Dict.discriminator<ClassTimeDocument>('ClassTime', schema, CLASS_TIME_DB_NAME)