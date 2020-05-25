import {RequestMapping, GetMapping} from "../desc";

import {Context} from "koa";
import Share from "../models/Share";
import {PERSON_DB_NAME} from "../config/dbName";

@RequestMapping('shares')
export class ShareController {

  @GetMapping("", [])
  async index(ctx: Context): Promise<void> {
    const pageSize = Number(ctx.query.pageSize) || 20
    const page = Number(ctx.query.pageNum) || 1
    const match = ctx.query
    delete match.pageSize
    delete match.pageNum
    console.log(match)
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
        $match: match
      },
      {
        $addFields: {
          shareUser: {$arrayElemAt: ["$shareUser", 0]},
          subscribeUser: {$arrayElemAt: ["$subscribeUser", 0]},
        }
      },
    ]).limit(pageSize).skip((page - 1) * pageSize)
    const shareListCount = await Share.aggregate([
      {
        $match: match
      },
      {
        $group: {
          _id: null,
          count: {$sum: 1}
        }
      }
    ])
    const total = shareListCount && shareListCount[0] && shareListCount[0].count || 0
    ctx.body = {
      total,
      list: shareList
    }
  }
}