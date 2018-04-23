import * as express from "express";
import { AuthToken } from "../authz/token";

export interface AuthenticatedRequest extends express.Request {
  token: AuthToken;
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

export const throwParseError = badKeys => {
  throw { kind: "ParseError", badKeys };
};

export const throwParseErrorIfUndefined = (obj, path) => {
  try {
    const val = path.reduce((acc, x) => acc[x], obj);
    if (val === undefined) throw Error("catchme");
  } catch (_err) {
    throwParseError([path.join(".")]);
  }
};
