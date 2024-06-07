import { FastifyRequest } from "fastify";

import { AuthToken } from "../authz/token";
import { TruBudgetError } from "../error";
import logger from "../lib/logger";

export interface AuthenticatedRequest extends FastifyRequest {
  user: AuthToken;
}

export interface SuccessResponse {
  apiVersion: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

export interface ErrorResponse {
  apiVersion: string;
  error: {
    code: number;
    message: string;
  };
}

export type HttpStatusCode = number;
export type HttpResponse = [HttpStatusCode, SuccessResponse | ErrorResponse];

export const throwParseError = (badKeys, message?): TruBudgetError => {
  throw new TruBudgetError({ kind: "ParseError", badKeys, message });
};

export const throwParseErrorIfUndefined = (obj, path): void => {
  try {
    const val = path.reduce((acc, x) => acc[x], obj);
    logger.debug({ parsedValues: { obj, path, val } }, "Checking parsed values");
    if (val === undefined) {
      throwParseError(path[path.length - 1], "Value undefined");
    }
  } catch (_err) {
    throwParseError([path.join(".")], _err.message);
  }
};
