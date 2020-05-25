import {PERSON_STATUS_NO_PASS, PERSON_STATUS_PASS, PERSON_STATUS_READY} from "./const";

export const PERSON_STATUS_MAP: Map<number, string> = new Map([
  [PERSON_STATUS_READY, '待审核'],
  [PERSON_STATUS_PASS, '通过'],
  [PERSON_STATUS_NO_PASS, '拒绝'],
])