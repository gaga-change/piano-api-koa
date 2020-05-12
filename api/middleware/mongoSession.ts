import {Context, Next} from "koa";
import mongoose from "mongoose";

export const mongoSession = async (ctx: Context, next: Next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  ctx.state.session = session
  await next()
    .then(async () => {
      await session.commitTransaction()
    })
    .catch(async (error) => {
      await session.abortTransaction();
      error.status = 400
      error.expose = true
      return Promise.reject(error)
  })
  session.endSession()
}