import mongoose, {Document, Schema} from 'mongoose';

export interface ProductDocument extends Document {
  name: string
  price: number
  totalTime: number
  disabled: boolean
  remark: string
}

const schema = new Schema({
  name: {type: String, default: '', trim: true}, // 名称
  price: {type: Number, default: 0}, // 价格
  totalTime: {type: Number, default: 0}, // 总课时
  disabled: {type: Boolean, default: false }, // 是否禁用
  remark: {type: String, default: '', trim: true}, // 备注
}, {
  timestamps: true,
})

export default mongoose.model<ProductDocument>('Product', schema, 'piano_product')