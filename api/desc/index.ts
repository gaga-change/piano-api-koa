import 'reflect-metadata'

import Router from "koa-router";
import * as nodePath from 'path'
import Application from "koa";

const basePathKey = Symbol.for('BASE_PATH')
interface test {
  method: string,
  path: Function,
  middleware:  Array<Router.IMiddleware>
}
interface middleware {
  (ctx: Application.Context, next: Application.Next):Promise<void>
}

export const routerMap: Array<test> = []

export function Inject(model: any) {
  return (target: any, key: string) => {
    target[key] = model
  }
}

export function RequestMapping(path: string, method?: string, beforeMiddleware: (middleware)[] = [], afterMiddleware: (middleware)[] = []) {
  return function (target: any, propertyKey?: string, descriptor?: PropertyDescriptor ) {
    if (!propertyKey && !descriptor) { // 类
      Reflect.defineMetadata(basePathKey, path || '/', target.prototype)
    } else if (propertyKey && descriptor) { // 方法
      routerMap.push({
        method, path: () => {
          return nodePath.posix.join('/', Reflect.getMetadata(basePathKey, target), path || '')
        }, middleware: [...beforeMiddleware, target[propertyKey].bind(target), ...afterMiddleware]
      })
    }
  }
}

export function GetMapping(path: string, beforeMiddleware?: (middleware)[], afterMiddleware?: (middleware)[]) {
  return RequestMapping(path,'get', beforeMiddleware, afterMiddleware)
}

export function PostMapping(path: string, beforeMiddleware?: (middleware)[], afterMiddleware?: (middleware)[]) {
  return RequestMapping(path,'post',  beforeMiddleware, afterMiddleware)
}

export function DeleteMapping(path: string, beforeMiddleware?: (middleware)[], afterMiddleware?: (middleware)[]) {
  return RequestMapping(path,'delete',  beforeMiddleware, afterMiddleware)
}

export function PutMapping(path: string, beforeMiddleware?: (middleware)[], afterMiddleware?: (middleware)[]) {
  return RequestMapping( path,'put', beforeMiddleware, afterMiddleware)
}