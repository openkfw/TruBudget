import { VError } from "verror";

/**
 * A type that that can either contain a given type T or an Error
 */
type Result<T> = T | Error;

/**
 * Type {@link Result} that can either contain a given type T or an Error
 */
export type Type<T> = Result<T>;

/**
 * Checks if the given result is an error
 *
 * @param result an object wrapped in a {@link Result} that might be an error
 * @returns a boolean indicating if the given result is an error or not
 */
export function isErr<T>(result: Result<T>): result is Error {
  return result instanceof Error;
}

/**
 * Checks if the given result is Ok
 *
 * @param result an object wrapped in a {@link Result} that might be an error
 * @returns a boolean indicating if the given result is ok or not
 */
export function isOk<T>(result: Result<T>): result is T {
  return !isErr(result);
}

/**
 * A given map function
 */
type MapFn<T, U> = (t: T) => U;
/**
 * Maps the result to an error or applies the desired function on the result
 *
 * @param result an element wrapped in a {@link Result}
 * @param fn a callback function that should be applied to the result
 * @returns the result of the function or an error
 */
export function map<T, U>(result: Result<T>, fn: MapFn<T, U>): Result<U> {
  if (result instanceof Error) {
    return result;
  } else {
    return fn(result);
  }
}

/**
 * Applies a function to an error or returns the result
 *
 * @param result an element wrapped in a {@link Result}
 * @param fn a callback function that should be applied to the result
 * @returns the result of the function if the element is an error or the given element otherwise
 */
export function mapErr<T>(result: Result<T>, fn: MapFn<Error, Error>): Result<T> {
  if (result instanceof Error) {
    return fn(result);
  } else {
    return result;
  }
}

/**
 * Unwraps the result or throws an error
 *
 * @param result an element wrapped in a {@link Result}
 * @param message an optional message to be used when throwing the error
 * @returns the unwrapped result
 */
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

/**
 * Unwraps the error or throws an error
 *
 * @param result an element wrapped in a {@link Result}
 * @param message an optional message to be used when throwing the error
 * @returns the unwrapped error if the given element was indeed an error
 */
export function unwrapErr<T>(result: Result<T>, message?: string): Error | never {
  if (result instanceof Error) {
    return result as Error;
  } else {
    throw new Error((message ? `${message}: ` : "") + `expected error, got value: ${result}`);
  }
}

/**
 * Unwraps the result or returns a default value
 *
 * @param result an element wrapped in a {@link Result}
 * @param defaultValue default value
 * @returns the unwrapped result or the default value in case the given element is an error
 */
export function unwrapOr<T, U>(result: Result<T>, defaultValue: U): T | U {
  if (result instanceof Error) {
    return defaultValue;
  } else {
    return result;
  }
}
