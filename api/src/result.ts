import { VError } from "verror";

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

export function mapErr<T>(result: Result<T>, fn: mapFn<Error, Error>): Result<T> {
  if (result instanceof Error) {
    return fn(result);
  } else {
    return result;
  }
}

export function unwrap<T>(result: Result<T>, message?: string): T | never {
  if (result instanceof Error) {
    if (message) {
      throw new VError(result, message);
    } else {
      throw result;
    }
  } else {
    return result as T;
  }
}

export function unwrap_err<T>(result: Result<T>, message?: string): Error | never {
  if (result instanceof Error) {
    return result as Error;
  } else {
    throw new Error((message ? `${message}: ` : "") + `expected error, got value: ${result}`);
  }
}

export function unwrap_or<T, U>(result: Result<T>, defaultValue: U): T | U {
  if (result instanceof Error) {
    return defaultValue;
  } else {
    return result;
  }
}
