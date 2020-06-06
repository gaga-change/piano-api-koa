import mongoose, {Document, Schema} from 'mongoose';
import {StudentDocument} from "./Student";
import {ProductDocument} from "./Product";

export interface OrderDocument extends Document {
  product: Schema.Types.ObjectId | ProductDocument | string
  student: Schema.Types.ObjectId | StudentDocument | string
  excessTime: number
  remark: string
}

const schema = new Schema({
  product: {type: Schema.Types.ObjectId, ref: 'Product', required: true}, // 商品
  student: {type: Schema.Types.ObjectId, ref: 'Student', required: true}, // 学生
  excessTime: {type: Number, default: 0}, // 剩余课时
  remark: {type: String, default: '', trim: true}, // 备注
}, {
  timestamps: true,
})

export default mongoose.model<OrderDocument>('Order', schema, 'piano_order')