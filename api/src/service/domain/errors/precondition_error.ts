import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";

export class PreconditionError extends Error {
  constructor(
    private readonly ctx: Ctx,
    private readonly businessEvent: BusinessEvent,
    message: string,
  ) {
    // TODO this shouldn't be failed to apply event but failed to execute intent
    super(`Failed to apply ${businessEvent.type}, a precondition is not fulfilled: ${message}`);

    this.name = "PreconditionError";
    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PreconditionError);
    }
  }
}
