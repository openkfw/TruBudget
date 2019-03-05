import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";

export class EventSourcingError extends Error {
  constructor(
    private readonly ctx: Ctx,
    private readonly businessEvent: BusinessEvent,
    private readonly error: string,
    private readonly entity?: any,
  ) {
    super(
      `Failed to apply ${businessEvent.type} ${
        entity === undefined ? "(no entity)" : `to ${JSON.stringify(entity)}`
      } during event-sourcing: ${error}.`,
    );

    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EventSourcingError);
    }
  }
}
