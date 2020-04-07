const router = require('koa-router')()

const enumController = require('./enum')

router.post('/api/enums', enumController.create.bind(enumController))
router.delete('/api/enums/:id', enumController.destroy.bind(enumController))
router.put('/api/enums/:id', enumController.update.bind(enumController))
router.get('/api/enums/:id', enumController.show.bind(enumController))
router.get('/api/enums', enumController.index.bind(enumController))

module.exports = router.routes()