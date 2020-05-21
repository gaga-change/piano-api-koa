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


export function Controller(path?: string) {
  return function (target: any) {
    Reflect.defineMetadata(basePathKey, path || '/', target.prototype)
  }
}

export function RequestMapping(method: string, path: string, beforeMiddleware: (middleware)[] = [], afterMiddleware: (middleware)[] = []) {
  return function (target: any, propertyKey: string) {
    routerMap.push({
      method, path: () => {
        return nodePath.posix.join('/', Reflect.getMetadata(basePathKey, target), path)
      }, middleware: [...beforeMiddleware, target[propertyKey].bind(target), ...afterMiddleware]
    })
  }
}

export function GetMapping(path: string, beforeMiddleware?: (middleware)[], afterMiddleware?: (middleware)[]) {
  return RequestMapping('get', path, beforeMiddleware, afterMiddleware)
}

export function PostMapping(path: string, beforeMiddleware?: (middleware)[], afterMiddleware?: (middleware)[]) {
  return RequestMapping('post', path, beforeMiddleware, afterMiddleware)
}

export function DeleteMapping(path: string, beforeMiddleware?: (middleware)[], afterMiddleware?: (middleware)[]) {
  return RequestMapping('delete', path, beforeMiddleware, afterMiddleware)
}

export function PutMapping(path: string, beforeMiddleware?: (middleware)[], afterMiddleware?: (middleware)[]) {
  return RequestMapping('put', path, beforeMiddleware, afterMiddleware)
}