import Application, {Context} from "koa";
import {GetMapping, Inject, PostMapping, RequestMapping} from "../desc";
import SpaceRule, {SpaceRuleDocument} from "../models/SpaceRule";

import Controller from "../tools/Controller";
import {checkAuth} from "../middleware/auth";
import {mongoSession} from "../middleware/mongoSession";

@RequestMapping('spaceRules')
export class SpaceRuleController extends Controller<SpaceRuleDocument> {
  @Inject(SpaceRule)
  Model:any
  /**
   * 清理 主文档被删除的文档
   * @param ctx
   */
  @PostMapping('spaceRulesClearNoTeacherOrStudent', [checkAuth])
  async clearDiscardDoc(ctx: Context) {
    ctx.body = await SpaceRule.removeNoTeacherOrStudent()
  }

  /** 批量修改 */
  @PostMapping('spaceRulesUpdate', [checkAuth, mongoSession])
  async modify(ctx: Context) {
    const {session} = ctx.state
    const {del: delIds = [], add: addItems = []} = ctx.request.body
    ctx.assert(delIds.length && addItems.length, 400, '参数异常')
    let person:any
    if (addItems.length) {
      person = addItems[0].person
    } else {
      let temp = await SpaceRule.findById(delIds[0], undefined, {session})
      person = temp.person
    }
    for (let i in addItems) {
      await SpaceRule.create(addItems[i], {session})
    }
    if (delIds.length) {
      await SpaceRule.deleteMany({_id: {$in: delIds}}, {session})
    }
    // 校验规则（不能有连续的时间，不能重叠）
    {
      const rules = await SpaceRule.find({person}, undefined, {session}).sort('-startTime')
      if (rules.length > 1) {
        for(let i = 0; i < (rules.length - 1); i ++) {
          let temp = rules[i]
          let next = rules[i + 1]
          ctx.assert(temp.endTime > next.startTime, 400, '时间段不能连续或重叠')
        }
      }
    }
    ctx.body = ctx.request.body
  }

  @GetMapping('')
  async index(ctx: Application.Context): Promise<void> {
    await super.index(ctx);
  }
}