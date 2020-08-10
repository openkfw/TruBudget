import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";

/**
 * @param {string} id           Identity which already exists.
 * @param {string} message      Optional custom error message.
 */
export class AlreadyExists extends Error {
  constructor(
    private readonly ctx: Ctx,
    private readonly businessEvent: BusinessEvent,
    id: string,
    message: string = `Intent ${businessEvent.type} failed. ${id} already exists.`,
  ) {
    super(message);

    this.name = "AlreadyExists";
    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AlreadyExists);
    }
  }
}
