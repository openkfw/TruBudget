import { NextFunction } from "express";
import { CustomExpressRequest, CustomExpressResponse } from "./types";

/** * Class representing an API error. *
 * @extends ExtendableError
 * @param {string} message - Error message.
 * @param {number} status - HTTP status code of error.
 * @param {boolean} isPublic - Whether the message should be visible to user or not.
 * @param {string | null} originalMessage - Original Error message that was thrown.
 */
export class APIError extends Error {
  status: number;
  isPublic: boolean;

  constructor(message: string, status = 500, isPublic: boolean) {
    super(message);
    this.name = this.constructor.name;
    this.message = message;
    this.status = status;
    this.isPublic = isPublic;
  }
}

/**
 * Executes callback function and process the error if occured.
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
