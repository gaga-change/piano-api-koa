import { RequestMapping, GetMapping } from "../desc";

import {Context} from "koa";
import Teacher from "../models/Teacher";
import Student from "../models/Student";
import {PERSON_STATUS_READY} from "../config/const";

@RequestMapping('dashboard')
export class DashboardController {
  @GetMapping("readyDataNum")
  async home(ctx: Context) {
    ctx.body = {
      teacherReadyNum: await Teacher.countDocuments({status: PERSON_STATUS_READY}),
      studentReadyNum: await Student.countDocuments({status: PERSON_STATUS_READY}),
    }
  }
}