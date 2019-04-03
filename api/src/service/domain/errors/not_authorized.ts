import { isArray } from "util";
import { VError } from "verror";

import Intent from "../../../authz/intents";
import { Ctx } from "../../../lib/ctx";

interface Info {
  ctx: Ctx;
  userId: string;
  intent: Intent | Intent[];
  target?: any;
}

function mkMessage(info: Info): string {
  const { userId, intent } = info;
  return `user ${userId} is not authorized for ${
    isArray(intent) ? `any of ${intent.join(", ")}` : intent
  }`;
}

function mkInfo(info: Info): Info {
  // Removing trace events as they're not needed and spam the log output when printed:
  if (info.target === undefined || info.target.log === undefined) {
    return info;
  }
  const { target, log: _log } = info.target;
  return target;
}

export class NotAuthorized extends VError {
  constructor(info: Info, cause?: Error) {
    super(
      {
        name: "NotAuthorized",
        cause,
        info: mkInfo(info),
      },
      mkMessage(info),
    );
  }
}
