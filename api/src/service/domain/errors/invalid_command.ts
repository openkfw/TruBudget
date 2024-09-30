import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";

export class InvalidCommand extends Error {
  constructor(
    private readonly ctx: Ctx,
    private readonly businessEvent: BusinessEvent,
    private readonly validationErrors: Error[],
  ) {
    // TODO for 2.x: this shouldn't be failed to apply event but failed to execute intent
    super(
      `Failed to apply ${businessEvent.type}: ${validationErrors
        .map((e) => e.message)
        .join("; ")}.`,
    );

    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidCommand);
    }
  }
}
