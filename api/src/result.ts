type Result<T> = T | Error;
export type Type<T> = Result<T>;

export function isErr<T>(result: Result<T>): result is Error {
  return result instanceof Error;
}

export function isOk<T>(result: Result<T>): result is T {
  return !isErr(result);
}

type mapFn<T, U> = (t: T) => U;
export function map<T, U>(result: Result<T>, fn: mapFn<T, U>): Result<U> {
  if (result instanceof Error) {
    return result;
  } else {
    return fn(result);
  }
}
