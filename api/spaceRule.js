
const SpaceRule = require('./models/SpaceRule')
const Controller = require('./Controller')

class SpaceRuleController extends Controller {
  constructor(model) {
    super(model, { defaultSort: { startTime: 1 } })
  }
}

module.exports = new SpaceRuleController(SpaceRule)