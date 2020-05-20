import { Controller, GetMapping } from "../desc";

import { Context } from "vm";

@Controller('/dashboard')
export class DashboardController {
  @GetMapping("readyDataNum")
  async home(ctx: Context) {
    ctx.body = "gaga"
  }
}