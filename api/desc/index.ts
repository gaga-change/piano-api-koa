import 'reflect-metadata'

import Router from "koa-router";
import {join}  from 'path'

// const basePathKey = Symbol.for('BASE_PATH')
const basePathKey = 'BASE_PATH'
interface test {
  method: string,
  path: string,
  fun: Array<Router.IMiddleware>
}

export const routerMap: Array<test> = []


export function Controller(path?: string) {
  return function (target: any) {
    // target.prototype._basePath = path || '/'
    Reflect.defineMetadata(basePathKey, path || '/', target.prototype)
    console.log('喵喵喵', target, target.prototype)
    console.log('喵喵喵 end')
    // console.log("hello(): 执行.", target, propertyKey, descriptor);
  }
}

export function RequestMapping(method: string, path: string) {
  console.log("hello(): 加载.", method, path);
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    // map[path] = target[propertyKey]
    // routerMap.push({ method, path: join(target._basePath, path), fun: [target[propertyKey].bind(target)] })
    console.log('???', Reflect.getMetadata(basePathKey, target), target[basePathKey])
    routerMap.push({ method, path, fun: [target[propertyKey].bind(target)] })
    console.log("hello(): 执行.", target, propertyKey, descriptor);
  }
}

export function GetMapping(path: string) {
  return RequestMapping('get', path)
}

export function PostMapping(path: string) {
  return RequestMapping('post', path)
}

export function DeleteMapping(path: string) {
  return RequestMapping('delete', path)
}

export function PutMapping(path: string) {
  return RequestMapping('put', path)
}

