import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";

export class InvalidEvent extends Error {
  constructor(
    private readonly ctx: Ctx,
    private readonly businessEvent: BusinessEvent,
    private readonly validationErrors: Error[],
  ) {
    super(
      `Failed to apply ${businessEvent.type}: ${validationErrors
        .map((e) => e.message)
        .join("; ")}.`,
    );

    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidEvent);
    }
  }
}
