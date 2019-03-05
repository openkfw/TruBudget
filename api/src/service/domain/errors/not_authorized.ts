import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";

export class NotAuthorized extends Error {
  constructor(
    private readonly ctx: Ctx,
    private readonly userId: string,
    private readonly businessEvent?: BusinessEvent,
    private readonly intent?: Intent,
  ) {
    super(
      `User ${userId} is not authorized${
        businessEvent ? ` to apply ${businessEvent.type}` : ` to invoke ${intent}`
      }.`,
    );

    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotAuthorized);
    }
  }
}
