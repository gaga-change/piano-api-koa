import Router from 'koa-router'
const router = new Router()

import auth from './controller/authController';
import enumController from './controller/enumController';
import courseController from './controller/courseController';
import leaveAreaController from './controller/leaveAreaController';
import spaceAreaController from './controller/spaceAreaController';
import spaceRuleController from './controller/spaceRuleController';
import studentController from './controller/studentController';
import teacherController from './controller/teacherController';
import wxController from './wx/wxController';
import wxTeacherController from './wx/teacher/wxTeacherController';
import wxStudentController from './wx/student/wxStudentController';

const checkAuth = auth.checkAuth.bind(auth)
const checkAdmin = auth.checkAdmin.bind(auth)
const { teacherAuth, studentAuth } = wxController

router.get('/api/wx/:type/tagsSync', wxController.wxTagSync.bind(wxController))
router.get('/api/wx/account', wxController.wxAccount.bind(wxController))
router.get('/api/wx/:type/login', wxController.wxLogin.bind(wxController))
router.post('/api/wx/teacher/register', teacherAuth, wxTeacherController.register)
router.post('/api/wx/student/register', studentAuth, wxStudentController.register)

router.post('/api/auth/login', auth.login.bind(auth))
router.post('/api/auth/logout', auth.logout.bind(auth))
router.get('/api/auth/account', checkAuth, auth.account)

router.post('/api/enums', checkAuth, checkAdmin, enumController.create.bind(enumController))
router.delete('/api/enums/:id', checkAuth, checkAdmin, enumController.destroy.bind(enumController))
router.put('/api/enums/:id', checkAuth, checkAdmin, enumController.update.bind(enumController))
router.get('/api/enums/:id', enumController.show.bind(enumController))
router.get('/api/enums', enumController.index.bind(enumController))
router.get('/api/enumsTotal', enumController.total.bind(enumController))

router.post('/api/courses', checkAuth, courseController.create.bind(courseController))
router.delete('/api/courses/:id', checkAuth, courseController.destroy.bind(courseController))
router.put('/api/courses/:id', checkAuth, courseController.update.bind(courseController))
router.get('/api/courses/:id', courseController.show.bind(courseController))
router.get('/api/courses', courseController.index.bind(courseController))

router.post('/api/leaveAreas', checkAuth, leaveAreaController.create.bind(leaveAreaController))
router.delete('/api/leaveAreas/:id', checkAuth, leaveAreaController.destroy.bind(leaveAreaController))
router.put('/api/leaveAreas/:id', checkAuth, leaveAreaController.update.bind(leaveAreaController))
router.get('/api/leaveAreas/:id', leaveAreaController.show.bind(leaveAreaController))
router.get('/api/leaveAreas', leaveAreaController.index.bind(leaveAreaController))

router.post('/api/spaceAreas', checkAuth, spaceAreaController.create.bind(spaceAreaController))
router.delete('/api/spaceAreas/:id', checkAuth, spaceAreaController.destroy.bind(spaceAreaController))
router.put('/api/spaceAreas/:id', checkAuth, spaceAreaController.update.bind(spaceAreaController))
router.get('/api/spaceAreas/:id', spaceAreaController.show.bind(spaceAreaController))
router.get('/api/spaceAreas', spaceAreaController.index.bind(spaceAreaController))
router.get('/api/spaceAreasAutoCreate', checkAuth, spaceAreaController.autoCreate.bind(spaceAreaController))
router.post('/api/spaceAreasClearNoTeacherOrStudent',checkAuth, spaceAreaController.clearDiscardDoc.bind(spaceAreaController))

router.post('/api/spaceRules', checkAuth, spaceRuleController.create.bind(spaceRuleController))
router.delete('/api/spaceRules/:id', checkAuth, spaceRuleController.destroy.bind(spaceRuleController))
router.put('/api/spaceRules/:id', checkAdmin, spaceRuleController.update.bind(spaceRuleController))
router.get('/api/spaceRules/:id', spaceRuleController.show.bind(spaceRuleController))
router.get('/api/spaceRules', spaceRuleController.index.bind(spaceRuleController))
router.post('/api/spaceRulesUpdate', checkAuth, spaceRuleController.modify.bind(spaceRuleController))
router.post('/api/spaceRulesClearNoTeacherOrStudent', checkAuth, spaceRuleController.clearDiscardDoc.bind(spaceRuleController))

router.post('/api/students', checkAuth, studentController.create.bind(studentController))
router.delete('/api/students/:id', checkAuth, studentController.destroy.bind(studentController))
router.put('/api/students/:id', checkAuth, studentController.update.bind(studentController))
router.get('/api/students/:id', studentController.show.bind(studentController))
router.get('/api/students', studentController.index.bind(studentController))

router.post('/api/teachers', checkAuth, teacherController.create.bind(teacherController))
router.delete('/api/teachers/:id', checkAuth, teacherController.destroy.bind(teacherController))
router.put('/api/teachers/:id', checkAuth, teacherController.update.bind(teacherController))
router.get('/api/teachers/:id', teacherController.show.bind(teacherController))
router.get('/api/teachers', teacherController.index.bind(teacherController))

export default router.routes()