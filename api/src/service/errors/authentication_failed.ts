import { VError } from "verror";

import { Ctx } from "../../lib/ctx";

interface Info {
  ctx: Ctx;
  organization: string;
  userId: string;
}

function mkMessage(cause?: Error | string): string {
  const msg = "authentication failed";
  if (cause === undefined || cause instanceof Error) {
    return msg;
  }
  return `${msg}: ${cause}`;
}

export class AuthenticationFailed extends VError {
  constructor(info: Info, cause?: Error | string) {
    super(
      {
        name: "AuthenticationFailed",
        cause: cause instanceof Error ? cause : undefined,
        info,
      },
      mkMessage(cause),
    );

    // Maintains proper stack trace for where our error was thrown (only available on V8):
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthenticationFailed);
    }
  }
}
