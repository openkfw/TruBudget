import { throwParseError } from "./httpd/lib";

export const isNonemptyString = (x: any): boolean => typeof x === "string" && x.length > 0;
// export const negate = (f: (any) => boolean) => (x: any): boolean => !f(x);

export const findBadKeysInObject = (
  expectedKeys: string[],
  isGood: (val: any) => boolean,
  candidate: any
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
