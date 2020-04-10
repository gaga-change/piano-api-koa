const router = require('koa-router')()

const auth = require('./auth')
const enumController = require('./enum')
const courseController = require('./course')
const leaveAreaController = require('./leaveArea')
const spaceAreaController = require('./spaceArea')
const spaceRuleController = require('./spaceRule')
const studentController = require('./student')
const teacherController = require('./teacher')
const wxController = require('./wx')


const { checkAdmin, checkAuth } = auth

router.get('/api/wx/:type/account', wxController.wxAccount)
router.get('/api/wx/:type/login', wxController.wxLogin)

router.post('/api/auth/login', auth.login)
router.post('/api/auth/logout', auth.logout)
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

router.post('/api/spaceRule', checkAuth, spaceRuleController.create.bind(spaceRuleController))
router.delete('/api/spaceRule/:id', checkAuth, spaceRuleController.destroy.bind(spaceRuleController))
router.put('/api/spaceRule/:id', checkAuth, spaceRuleController.update.bind(spaceRuleController))
router.get('/api/spaceRule/:id', spaceRuleController.show.bind(spaceRuleController))
router.get('/api/spaceRule', spaceRuleController.index.bind(spaceRuleController))

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

module.exports = router.routes()