
import { Schema } from 'mongoose';
import {CLASS_TYPE_DB_NAME} from "../config/dbName";
import Dict, {DictDocument} from "./Dict";

export interface ClassTypeDocument extends DictDocument {
}

const schema = new Schema({

}, {
  timestamps: true,
  discriminatorKey: 'kind'
})

export default Dict.discriminator<ClassTypeDocument>('ClassType', schema, CLASS_TYPE_DB_NAME)