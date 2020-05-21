import * as controllers from "./controller"

import Router from 'koa-router'
import auth from './controller/authController';
import courseController from './controller/courseController';
import enumController from './controller/enumController';
import leaveAreaController from './controller/leaveAreaController';
import {mongoSession} from "./middleware/mongoSession";
import {routerMap} from "./desc";
import spaceAreaController from './controller/spaceAreaController';
import spaceRuleController from './controller/spaceRuleController';
import studentController from './controller/studentController';
import teacherController from './controller/teacherController';
import wxController from './wx/wxController';
import wxStudentController from './wx/student/wxStudentController';
import wxTeacherController from './wx/teacher/wxTeacherController';

const router = new Router({prefix: '/api'})

const checkAuth = auth.checkAuth.bind(auth)
const checkAdmin = auth.checkAdmin.bind(auth)
const { teacherAuth, studentAuth } = wxController

router.get('/wx/:type/tagsSync', wxController.wxTagSync.bind(wxController))
router.get('/wx/account', wxController.wxAccount.bind(wxController))
router.get('/wx/:type/login', wxController.wxLogin.bind(wxController))
router.post('/wx/teacher/register', teacherAuth, wxTeacherController.register)
router.post('/wx/student/register', studentAuth, wxStudentController.register)

router.post('/auth/login', auth.login.bind(auth))
router.post('/auth/logout', auth.logout.bind(auth))
router.get('/auth/account', checkAuth, auth.account)

router.post('/enums', checkAuth, checkAdmin, enumController.create.bind(enumController))
router.delete('/enums/:id', checkAuth, checkAdmin, enumController.destroy.bind(enumController))
router.put('/enums/:id', checkAuth, checkAdmin, enumController.update.bind(enumController))
router.get('/enums/:id', enumController.show.bind(enumController))
router.get('/enums', enumController.index.bind(enumController))
router.get('/enumsTotal', enumController.total.bind(enumController))

router.post('/courses', checkAuth, mongoSession ,courseController.create.bind(courseController))
router.delete('/courses/:id', checkAuth, mongoSession, courseController.destroy.bind(courseController))
router.put('/courses/:id', checkAuth, mongoSession, courseController.update.bind(courseController))
router.get('/courses/:id', courseController.show.bind(courseController))
router.get('/courses', courseController.index.bind(courseController))
router.get('/coursesActivateArea', courseController.findActivateCourse.bind(courseController))

router.post('/leaveAreas', checkAuth, leaveAreaController.create.bind(leaveAreaController))
router.delete('/leaveAreas/:id', checkAuth, leaveAreaController.destroy.bind(leaveAreaController))
router.put('/leaveAreas/:id', checkAuth, leaveAreaController.update.bind(leaveAreaController))
router.get('/leaveAreas/:id', leaveAreaController.show.bind(leaveAreaController))
router.get('/leaveAreas', leaveAreaController.index.bind(leaveAreaController))

router.post('/spaceAreas', checkAuth, spaceAreaController.create.bind(spaceAreaController))
router.delete('/spaceAreas/:id', checkAuth, spaceAreaController.destroy.bind(spaceAreaController))
router.put('/spaceAreas/:id', checkAuth, spaceAreaController.update.bind(spaceAreaController))
router.get('/spaceAreas/:id', spaceAreaController.show.bind(spaceAreaController))
router.get('/spaceAreas', spaceAreaController.index.bind(spaceAreaController))
router.get('/spaceAreasAutoCreate', checkAuth, spaceAreaController.autoCreate.bind(spaceAreaController))
router.post('/spaceAreasClearNoTeacherOrStudent',checkAuth, spaceAreaController.clearDiscardDoc.bind(spaceAreaController))
router.get('/spaceAreaActivateArea',checkAuth, spaceAreaController.findByActivateArea.bind(spaceAreaController))

router.post('/spaceRules', checkAuth, spaceRuleController.create.bind(spaceRuleController))
router.delete('/spaceRules/:id', checkAuth, spaceRuleController.destroy.bind(spaceRuleController))
router.put('/spaceRules/:id', checkAdmin, spaceRuleController.update.bind(spaceRuleController))
router.get('/spaceRules/:id', spaceRuleController.show.bind(spaceRuleController))
router.get('/spaceRules', spaceRuleController.index.bind(spaceRuleController))
router.post('/spaceRulesUpdate', checkAuth, mongoSession, spaceRuleController.modify.bind(spaceRuleController))
router.post('/spaceRulesClearNoTeacherOrStudent', checkAuth, spaceRuleController.clearDiscardDoc.bind(spaceRuleController))

router.post('/students', checkAuth, studentController.create.bind(studentController))
router.delete('/students/:id', checkAuth, studentController.destroy.bind(studentController))
router.put('/students/:id', checkAuth, studentController.update.bind(studentController))
router.get('/students/:id', studentController.show.bind(studentController))
router.get('/students', studentController.index.bind(studentController))

router.post('/teachers', checkAuth, teacherController.create.bind(teacherController))
router.delete('/teachers/:id', checkAuth, teacherController.destroy.bind(teacherController))
router.put('/teachers/:id', checkAuth, teacherController.update.bind(teacherController))
router.get('/teachers/:id', teacherController.show.bind(teacherController))
router.get('/teachers', teacherController.index.bind(teacherController))

console.log('controllers 载入', Object.keys(controllers))
routerMap.forEach(({method, path, middleware}) => {
  console.log(path())
  router.register(path(), [method], middleware)
})

export default router.routes()