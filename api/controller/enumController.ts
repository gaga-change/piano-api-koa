import Enums, {EnumsDocument} from "../models/Enums";
import Controller from "../tools/Controller";
import {Context} from "koa";

class EnumsController extends Controller<EnumsDocument> {
  /** 获取所有枚举 */
  async total(ctx: Context) {
    ctx.body = await Enums.find({})
  }
}

export default new EnumsController(Enums)