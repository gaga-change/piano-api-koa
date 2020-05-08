
export default class ThrowError extends Error{
    private status: number;
    private expose: boolean;
    constructor(msg:string, code?:number) {
        super(msg);
        this.status = code || 400
        this.expose = true
    }
}