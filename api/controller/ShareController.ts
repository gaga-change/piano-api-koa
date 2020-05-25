import { RequestMapping, GetMapping } from "../desc";

import {Context} from "koa";
import Share from "../models/Share";
import {PERSON_DB_NAME} from "../config/dbName";

@RequestMapping('shares')
export class ShareController{

  @GetMapping("", [])
  async index(ctx: Context): Promise<void> {
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const shareList = await Share.aggregate([
      {
        $lookup: {
          from: PERSON_DB_NAME,
          localField: 'shareOpenid',
          foreignField: "openid",
          as: "shareUser"
        }
      },
      {
        $lookup: {
          from: PERSON_DB_NAME,
          localField: 'subscribeOpenid',
          foreignField: "openid",
          as: "subscribeUser"
        }
      },
      {
        $addFields: {
          shareUser:  {$arrayElemAt: ["$shareUser", 0]} ,
          subscribeUser:  {$arrayElemAt: ["$subscribeUser", 0]} ,
        }
      },
    ]).limit(pageSize).skip((page - 1) * pageSize)

    ctx.body = {
      total: await Share.countDocuments(),
      list: shareList
    }
  }
}