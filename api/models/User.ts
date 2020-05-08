
import mongoose , {Schema, Document}from 'mongoose'

export interface UserDocument extends Document{
  username: string
  password: string
}

const schema = new Schema({
  username: { type: String, },
  password: { type: String, },

},{
  timestamps: true,
})

export default mongoose.model<UserDocument>('User', schema, 'piano_user');