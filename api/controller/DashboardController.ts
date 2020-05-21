import { RequestMapping, GetMapping } from "../desc";

import {Context} from "koa";
import Teacher from "../models/Teacher";
import Student from "../models/Student";

@RequestMapping('dashboard')
export class DashboardController {
  @GetMapping("readyDataNum")
  async home(ctx: Context) {
    ctx.body = {
      teacherReadyNum: await Teacher.countDocuments({status: 0}),
      studentReadyNum: await Student.countDocuments({status: 0}),
    }
  }
}