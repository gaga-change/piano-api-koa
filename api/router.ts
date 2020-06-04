import * as controllers from "./controller"

import Router from 'koa-router'
import {routerMap} from "./desc";

const router = new Router({prefix: '/api'})

console.log('controllers 载入', Object.keys(controllers))
routerMap.forEach(({method, path, middleware}) => {
  router.register(path(), [method], middleware)
})

export default router.routes()