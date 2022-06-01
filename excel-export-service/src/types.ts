import { Request, Response } from "express";
import { Logger } from "pino";

export interface CustomExpressResponse extends Response {
  apiBase: string;
}
export interface CustomExpressRequest extends Request {
  log: Logger;
}
