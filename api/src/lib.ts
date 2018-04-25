import { throwParseError } from "./httpd/lib";

export const isNonemptyString = (x: any): boolean => typeof x === "string" && x.length > 0;
// export const negate = (f: (any) => boolean) => (x: any): boolean => !f(x);

export const findBadKeysInObject = (
  expectedKeys: string[],
  isGood: (val: any) => boolean,
  candidate: any
): string[] => expectedKeys.filter(key => typeof candidate !== "object" || !isGood(candidate[key]));

export const value = (name, val, isValid) => {
  if (!isValid(val)) throwParseError([name]);
  return val;
};
