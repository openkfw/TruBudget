import { throwParseError } from "./httpd/lib";
import * as User from "./user";

export const isNonemptyString = (x: any): boolean => typeof x === "string" && x.length > 0;
// export const negate = (f: (any) => boolean) => (x: any): boolean => !f(x);

export const isUserOrUndefined = async (multichain, input) => {
  if (input === undefined) {
    return true;
  } else {
    if (isNonemptyString) {
      const user = await User.get(multichain, input).catch(err => {
        if (err.kind === "NotFound") {
          return undefined;
        } else {
          throw err;
        }
      });
      return user !== undefined;
    } else {
      return false;
    }
  }
};

export const findBadKeysInObject = (
  expectedKeys: string[],
  isGood: (val: any) => boolean,
  candidate: any,
): string[] => expectedKeys.filter(key => typeof candidate !== "object" || !isGood(candidate[key]));

export const value = (name, val, isValid, defaultValue?) => {
  if (val === undefined) {
    val = defaultValue; // might be undefined
  }
  if (!isValid(val)) throwParseError([name]);
  return val;
};

export const asyncValue = async (name, val, isValid, defaultValue?) => {
  if (val === undefined) {
    val = defaultValue; // might be undefined
  }
  if (!(await isValid(val).catch(_err => false))) throwParseError([name]);
  return val;
};
