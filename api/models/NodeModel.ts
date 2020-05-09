import mongoose, {Schema, Document} from 'mongoose';
import {SchemaTimestampsDocument} from "../type/other";

export interface NodeDocument extends Document, SchemaTimestampsDocument{
  name: string,
}

const schema = new Schema({
  name: { type: String, default: '', trim: true }, // 名称
}, {
  timestamps: true,
})

export default mongoose.model<NodeDocument>('NodeModel', schema, 'piano_node');