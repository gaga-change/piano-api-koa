import {Context} from "koa";
import { GetMapping,  RequestMapping} from "../desc";
import * as localEnums from '../config/enums'
import Dict from "../models/Dict";

interface enums {
  [key: string]: Map<number, string>;
}

@RequestMapping('enums')
export class EnumsController {

  /** 获取所有枚举 */
  @GetMapping('enumsTotal')
  async total(ctx: Context) {
    // 名称格式转换 AA_BB_CC -> aaBbCc
    const turn = (str: string) => {
      str = str.toLowerCase()
      return str.replace(/_(\w)/g, (s: string, c: string) => {
        return c.toUpperCase()
      })
    }
    // 本地枚举获取
    let locals = Object.keys(<enums>localEnums).map(key => {
      const map = (<enums>localEnums)[key]
      return {
        name: turn(key),
        keyValue: [...map.keys()].map((k) => ({value: k, name: map.get(k)}))
      }
    })
    // 字典获取
    let dict = await Dict.aggregate([
      {
        $match: {disabled: false}
      },
      {
        $group: {
          _id: '$kind',
          keyValue: {$push: {value: "$_id", name: "$name", time: '$time'}}
        },
      }
    ])
      .project({name: "$_id", _id: 0, keyValue: 1})
    ctx.body = [
      ...locals,
      ...dict
    ]
  }
}