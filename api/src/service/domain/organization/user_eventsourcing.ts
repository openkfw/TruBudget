import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";
import * as UserCreated from "./user_created";
import * as UserRecord from "./user_record";
import { UserTraceEvent } from "./user_trace_event";

export function sourceUserRecords(
  ctx: Ctx,
  events: BusinessEvent[],
): { users: UserRecord.UserRecord[]; errors: EventSourcingError[] } {
  const users = new Map<UserRecord.Id, UserRecord.UserRecord>();
  const errors: EventSourcingError[] = [];
  for (const event of events) {
    apply(ctx, users, event, errors);
  }
  return { users: [...users.values()], errors };
}

function apply(
  ctx: Ctx,
  users: Map<UserRecord.Id, UserRecord.UserRecord>,
  event: BusinessEvent,
  errors: EventSourcingError[],
) {
  if (event.type === "user_created") {
    handleUserCreated(ctx, users, event, errors);
  }
}

function handleUserCreated(
  ctx: Ctx,
  users: Map<UserRecord.Id, UserRecord.UserRecord>,
  userCreated: UserCreated.Event,
  errors: EventSourcingError[],
) {
  const initialData = userCreated.user;

  let user = users.get(initialData.id);
  if (user !== undefined) return;

  user = {
    id: initialData.id,
    createdAt: userCreated.time,
    displayName: initialData.displayName,
    organization: initialData.organization,
    passwordHash: initialData.passwordHash,
    address: initialData.address,
    encryptedPrivKey: initialData.encryptedPrivKey,
    permissions: initialData.permissions,
    log: [],
    additionalData: initialData.additionalData,
  };

  const result = UserRecord.validate(user);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError(ctx, userCreated, result.message));
    return;
  }

  const traceEvent: UserTraceEvent = {
    entityId: initialData.id,
    entityType: "user",
    businessEvent: userCreated,
    snapshot: {
      displayName: user.displayName,
    },
  };
  user.log.push(traceEvent);

  users.set(initialData.id, user);
}
