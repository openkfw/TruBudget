import { Ctx } from "../../../lib/ctx";

export class NotFound extends Error {
  constructor(
    private readonly ctx: Ctx,
    private readonly entityType:
      | "project"
      | "subproject"
      | "workflowitem"
      | "group"
      | "user"
      | "document"
      | "notification",
    private readonly entityId: string,
  ) {
    super(`Not found: ${entityType} ${entityId}`);
    this.name = "NotFound";

    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFound);
    }
  }
}
