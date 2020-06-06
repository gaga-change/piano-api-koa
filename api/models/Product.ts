import {Schema} from 'mongoose';
import Dict, {DictDocument} from "./Dict";
import {PRODUCT_DB_NAME} from "../config/dbName";

export interface ProductDocument extends DictDocument {
  price: number
  time: number
}

const schema = new Schema({
  price: {type: Number, default: 0}, // 价格
  time: {type: Number, default: 0}, // 总课时
}, {
  timestamps: true,
})

export default Dict.discriminator<ProductDocument>('Product', schema, PRODUCT_DB_NAME)