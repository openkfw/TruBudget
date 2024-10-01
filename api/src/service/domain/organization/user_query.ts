import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { ConnToken } from "../../conn";
import { NotFound } from "../errors/not_found";

import * as Cache from "./../../cache2";
import { ServiceUser } from "./service_user";
import * as UserGet from "./user_get";
import * as UserRecord from "./user_record";

export async function getUsers(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<UserRecord.UserRecord[]>> {
  logger.debug("Getting all users");

  const usersResult = await Cache.withCache(conn, ctx, async (cache) =>
    UserGet.getAllUsers(ctx, serviceUser, {
      getUserEvents: async () => {
        return cache.getUserEvents();
      },
    }),
  );
  return Result.mapErr(usersResult, (err) => new VError(err, "could not fetch users"));
}

export async function getUser(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  userId: UserRecord.Id,
): Promise<Result.Type<UserRecord.UserRecord>> {
  logger.debug({ userId }, "Getting user by id");

  const usersResult = await getUsers(conn, ctx, serviceUser);
  if (Result.isErr(usersResult)) {
    return new VError(usersResult, "could not fetch users");
  }

  const user = usersResult.find((x) => x.id === userId);
  if (user === undefined) {
    return new NotFound(ctx, "user", userId);
  }
  return user;
}

export async function userExists(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  userId: UserRecord.Id,
): Promise<Result.Type<boolean>> {
  logger.debug({ userId }, "Checking existance of user by id");

  const usersResult = await getUsers(conn, ctx, serviceUser);
  if (Result.isErr(usersResult)) {
    return new VError(usersResult, "could not fetch users");
  }
  return usersResult.find((x) => x.id === userId) !== undefined;
}
