import { NextFunction } from "express";
import { CustomExpressRequest, CustomExpressResponse } from "./types";

/**
 * * @extends Error
 */
export class ExtendableError extends Error {
  status: number;
  isPublic: boolean;
  originalMessage: string | null;

  constructor(message: string, status: number, isPublic: boolean, originalMessage: string | null) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
    this.originalMessage = originalMessage;
  }
}

/**
 * Executes callback function and if error occures, it sends a notification email.
 * @param {*} callback Callback function.
 * @returns
 */
export const forwardError =
  (callback: Function) =>
  async (
    req: CustomExpressRequest,
    res: CustomExpressResponse,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await callback(req, res, next);
    } catch (error) {
      next(error);
    }
  };
