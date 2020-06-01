import ThrowError from "./ThrowError";

export default function (bool: boolean, msg: string, code?: number) {
  if (!bool) throw new ThrowError(msg, code)
}