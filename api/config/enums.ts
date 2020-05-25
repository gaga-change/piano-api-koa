import {
  COURSE_STATUS_NO_PASS,
  COURSE_STATUS_PASS,
  COURSE_STATUS_READY,
  LEAVE_AREA_STATUS_NO_PASS,
  LEAVE_AREA_STATUS_PASS,
  LEAVE_AREA_STATUS_READY,
  PERSON_STATUS_NO_PASS,
  PERSON_STATUS_PASS,
  PERSON_STATUS_READY, SHARE_TYPE_STUDENT, SHARE_TYPE_TEACHER
} from "./const";

export const PERSON_STATUS_MAP: Map<number, string> = new Map([
  [PERSON_STATUS_READY, '待审核'],
  [PERSON_STATUS_PASS, '通过'],
  [PERSON_STATUS_NO_PASS, '拒绝'],
])

export const LEAVE_AREA_STATUS_MAP: Map<number, string> = new Map([
  [LEAVE_AREA_STATUS_READY, '待审核'],
  [LEAVE_AREA_STATUS_PASS, '通过'],
  [LEAVE_AREA_STATUS_NO_PASS, '拒绝'],
])

export const COURSE_STATUS_MAP: Map<number, string> = new Map([
  [COURSE_STATUS_READY, '待完成 '],
  [COURSE_STATUS_PASS, '已完成'],
  [COURSE_STATUS_NO_PASS, '已取消'],
])

export const SHARE_TYPE_MAP: Map<number, string> = new Map([
  [SHARE_TYPE_TEACHER, '教师端'],
  [SHARE_TYPE_STUDENT, '学生端'],
])
