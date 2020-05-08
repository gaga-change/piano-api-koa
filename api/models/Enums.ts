// 清单

import mongoose, {Schema, Document} from 'mongoose';

interface KeyValue extends Document{
  name: string
  value: number
}

export interface EnumsDocument extends Document{
  name: string,
  keyValue: Array<KeyValue>
  remark: string
}


const KeyValueSchema = new Schema({
  name: { type: String, default: '', trim: true },
  value: { type: Number },
});

const schema = new Schema({
  name: { type: String, default: '', trim: true }, // 名称
  keyValue: { type: [KeyValueSchema], default: [] }, // 键值对
  remark: { type: String, default: '', trim: true }, // 备注
}, {
  timestamps: true,
})

export default mongoose.model<EnumsDocument>('Enum', schema, 'piano_enum');