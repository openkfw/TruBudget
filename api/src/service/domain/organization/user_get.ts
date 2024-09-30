import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotFound } from "../errors/not_found";

import { ServiceUser } from "./service_user";
import { sourceUserRecords } from "./user_eventsourcing";
import * as UserRecord from "./user_record";

interface Repository {
  getUserEvents(): Promise<BusinessEvent[]>;
}

export async function getOneUser(
  ctx: Ctx,
  _serviceUser: ServiceUser,
  userId: string,
  repository: Repository,
): Promise<Result.Type<UserRecord.UserRecord>> {
  logger.trace(
    "Fetching user by id. *NOTE* errors are ignored in this procedure. UserId is:",
    userId,
  );

  const allEvents = await repository.getUserEvents();

  // Errors are ignored here:
  const { users } = sourceUserRecords(ctx, allEvents);

  const userRecord = users.find((x) => x.id === userId);
  if (userRecord === undefined) {
    return new NotFound(ctx, "user", userId);
  }

  // If there would be permissions required for viewing a user, the authorization check
  // would be done here.

  return userRecord;
}

export async function getAllUsers(
  ctx: Ctx,
  _serviceUser: ServiceUser,
  repository: Repository,
): Promise<Result.Type<UserRecord.UserRecord[]>> {
  logger.trace("Fetching all users. *NOTE* errors are ignored in this procedure.");
  const allEvents = await repository.getUserEvents();
  // Errors are ignored here:
  const { users } = sourceUserRecords(ctx, allEvents);

  // If there would be permissions required for viewing a user, the authorization check
  // would be used here to filter the users accordingly.

  return users;
}
