import httpStatus = require("http-status");
import { ExtendableError } from "./errors";

/** * Class representing an API error. *
 * @extends ExtendableError
 * @param {string} message - Error message.
 * @param {number} status - HTTP status code of error.
 * @param {boolean} isPublic - Whether the message should be visible to user or not.
 * @param {string | null} originalMessage - Original Error message that was thrown.
 */
export class APIError extends ExtendableError {
  constructor(message, status = httpStatus.INTERNAL_SERVER_ERROR, isPublic = false, originalMessage = null) {
    super(message, status, isPublic, originalMessage);
  }
}
