import * as fastify from "fastify";
import * as http from "http";
import { AuthToken } from "../authz/token";

export interface AuthenticatedRequest extends fastify.FastifyRequest<http.IncomingMessage> {
  user: AuthToken;
}
export interface SuccessResponse {
  apiVersion: string;
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

export const throwParseError = (badKeys, message?) => {
  throw { kind: "ParseError", badKeys, message };
};

export const throwParseErrorIfUndefined = (obj, path) => {
  try {
    const val = path.reduce((acc, x) => acc[x], obj);
    if (val === undefined) throw Error("catchme");
  } catch (_err) {
    throwParseError([path.join(".")]);
  }
};
