import { throwParseError } from "../httpd/lib";
import { ConnToken } from "../service/conn";
import { ServiceUser } from "../service/domain/organization/service_user";
import * as UserQuery from "../service/domain/organization/user_query";

import { Ctx } from "./ctx";

export function isNonemptyString(x: unknown): boolean {
  return typeof x === "string" && x.length > 0;
}

export async function isUserOrUndefined(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  input,
): Promise<boolean> {
  if (input === undefined) {
    return true;
  }
  if (isNonemptyString(input)) {
    const user = await UserQuery.getUser(conn, ctx, issuer, input).catch((err) => {
      if (err.kind === "NotFound") {
        return undefined;
      } else {
        throw err;
      }
    });
    return user !== undefined;
  }

  return false;
}

export function findBadKeysInObject(
  expectedKeys: string[],
  isGood: (val: unknown) => boolean,
  candidate,
): string[] {
  return expectedKeys.filter((key) => typeof candidate !== "object" || !isGood(candidate[key]));
}
export function isDate(date: string): Date {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return new Date(date) !== "Invalid Date" && !isNaN(new Date(date));
}

export function isNumber(x): boolean {
  return !isNaN(x);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function value(name, val, isValid, defaultValue?): any {
  if (val === undefined) {
    val = defaultValue; // might be undefined
  }
  if (!isValid(val)) throwParseError([name]);
  return val;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function asyncValue(multichain, name, val, isValid, defaultValue?): Promise<any> {
  if (val === undefined) {
    val = defaultValue; // might be undefined
  }
  if (!(await isValid(multichain, val).catch((_err) => false))) {
    throwParseError([name]);
  }
  return val;
}

export function isObject(x): boolean {
  return x != null && typeof x === "object";
}
