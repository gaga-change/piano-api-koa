import {DefaultState} from "koa";

export interface SchemaTimestampsDocument {
    createdAt: Date;
    updatedAt: Date;
}

export interface StateType extends DefaultState{
    isTeacher: boolean
}

declare module "koa" {
    interface Context {
        isTeacher: boolean;
        openid: string | null
    }
}