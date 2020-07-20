import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";

/**
 * @param {string} id           Identity which already exists.
 */
export class AlreadyExists extends Error {
  constructor(
    private readonly ctx: Ctx,
    private readonly businessEvent: BusinessEvent,
    id: string,
  ) {
    super(`Intent ${businessEvent.type} failed. ${id} already exists.`);

    this.name = "AlreadyExists";
    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AlreadyExists);
    }
  }
}
