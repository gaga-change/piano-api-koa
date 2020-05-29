import {PersonDocument} from "../models/Person";
import {TEACHER_DB_NAME} from "../config/dbName";
import {FindByActivateAreaOptions} from "./aggregateConfig";

/**
 * 将person 转为指定的 teacher | student
 * @param person
 */
export const personToTeacherOrStudent = (person: PersonDocument): FindByActivateAreaOptions => {
  if (person.kind === TEACHER_DB_NAME) {
    return {teacher: person}
  } else {
    return {student: person}
  }
}