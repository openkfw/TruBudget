import { Event } from "./event";

export class EventParsingError extends Error {
  constructor(private readonly error: Error | string, private readonly event: Event) {
    super(`${error} for ${JSON.stringify(event)}`);

    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, EventParsingError);
    }
  }
}
