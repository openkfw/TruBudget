import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";

interface Info {
  ctx: Ctx;
  event: BusinessEvent;
  target?: any;
}

function mkMessage(info: Info, cause?: Error | string): string {
  const msg = `failed to apply ${info.event.type}`;
  if (cause === undefined || cause instanceof Error) {
    return msg;
  }
  return `${msg}: ${cause}`;
}

function mkInfo(info: Info): Info {
  // Removing trace events as they're not needed and spam the log output when printed:
  if (info.target === undefined || info.target.log === undefined) {
    return info;
  }
  const { target, log: _log } = info.target;
  return target;
}

export class EventSourcingError extends VError {
  constructor(info: Info, cause?: Error | string) {
    super(
      {
        name: "EventSourcingError",
        cause: cause instanceof Error ? cause : undefined,
        info: mkInfo(info),
      },
      mkMessage(info, cause),
    );
  }
}
