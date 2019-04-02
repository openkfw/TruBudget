import { isArray } from "util";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";

export class NotAuthorized extends Error {
  private readonly target?: object;

  constructor(
    private readonly ctx: Ctx,
    private readonly userId: string,
    private readonly intent: Intent | Intent[],
    target?: object,
  ) {
    super(
      `user ${userId} is not authorized for ${
        isArray(intent) ? `any of ${intent.join(", ")}` : intent
      }`,
    );

    // This allows us to identify this error in a chain of errors later on:
    this.name = "NotAuthorized";

    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotAuthorized);
    }

    // Removing trace events as they're not needed and spam the log output when printed:
    if (target !== undefined && (target as any).log !== undefined) {
      delete (target as any).log;
    }
    this.target = target;
  }
}
