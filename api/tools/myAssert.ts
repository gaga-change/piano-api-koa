import ThrowError from "./ThrowError";

export default function (bool: boolean, msg: string) {
  if (!bool) throw new ThrowError(msg)
}