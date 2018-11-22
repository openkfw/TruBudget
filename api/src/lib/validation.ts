import { throwParseError } from "../httpd/lib";
import * as User from "../user/model/user";
import logger from "./logger";

export function isNonemptyString(x: any): boolean {
  return typeof x === "string" && x.length > 0;
}

export async function isUserOrUndefined(multichain, input) {
  if (input === undefined) {
    return true;
  } else {
    if (isNonemptyString) {
      const user = await User.get(multichain, input).catch(err => {
        if (err.kind === "NotFound") {
          logger.error({ error: err }, "User not found");
          return undefined;
        } else {
          logger.error({ error: err }, "An error occured");
          throw err;
        }
      });
      return user !== undefined;
    } else {
      logger.error("Did not receive proper input");
      return false;
    }
  }
}

export function findBadKeysInObject(
  expectedKeys: string[],
  isGood: (val: any) => boolean,
  candidate: any,
): string[] {
  return expectedKeys.filter(key => typeof candidate !== "object" || !isGood(candidate[key]));
}

export function value(name, val, isValid, defaultValue?) {
  if (val === undefined) {
    val = defaultValue; // might be undefined
  }
  if (!isValid(val)) throwParseError([name]);
  return val;
}

export async function asyncValue(multichain, name, val, isValid, defaultValue?) {
  if (val === undefined) {
    val = defaultValue; // might be undefined
  }
  if (!(await isValid(multichain, val).catch(_err => false))) {
    logger.error({ multichain, val, name }, "Error while checking validity");
    throwParseError([name]);
  }
  return val;
}

export function isObject(x) {
  return x != null && typeof x === "object";
}
