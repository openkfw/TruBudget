import { throwParseError } from "../httpd/lib";
import { ConnToken } from "../service/conn";
import { ServiceUser } from "../service/domain/organization/service_user";
import * as UserQuery from "../service/user_query";
import { Ctx } from "./ctx";

export function isNonemptyString(x: any): boolean {
  return typeof x === "string" && x.length > 0;
}

export async function isUserOrUndefined(conn: ConnToken, ctx: Ctx, issuer: ServiceUser, input) {
  if (input === undefined) {
    return true;
  } else {
    if (isNonemptyString(input)) {
      const user = await UserQuery.getUser(conn, ctx, issuer, input).catch((err) => {
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
}

export function findBadKeysInObject(
  expectedKeys: string[],
  isGood: (val: any) => boolean,
  candidate: any,
): string[] {
  return expectedKeys.filter((key) => typeof candidate !== "object" || !isGood(candidate[key]));
}
export function isDate(date: string) {
  // @ts-ignore
  return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
}

export function isNumber(x: any) {
  return !isNaN(x);
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
  if (!(await isValid(multichain, val).catch((_err) => false))) {
    throwParseError([name]);
  }
  return val;
}

export function isObject(x) {
  return x != null && typeof x === "object";
}
