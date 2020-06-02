
import { Schema } from 'mongoose';
import { COMBO_DB_NAME} from "../config/dbName";
import Dict, {DictDocument} from "./Dict";

export interface ComboDocument extends DictDocument {
}

const schema = new Schema({
  time: {type: Number, required: true}
}, {
  timestamps: true,
  discriminatorKey: 'kind'
})

export default Dict.discriminator<ComboDocument>('Combo', schema, COMBO_DB_NAME)