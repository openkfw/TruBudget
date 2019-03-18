import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { NotFound } from "./domain/errors/not_found";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserGet from "./domain/organization/user_get";
import * as UserRecord from "./domain/organization/user_record";

export async function getUsers(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<UserRecord.UserRecord[]> {
  try {
    const users = await Cache.withCache(conn, ctx, async cache =>
      UserGet.getAllUsers(ctx, serviceUser, {
        getUserEvents: async () => {
          return cache.getUserEvents();
        },
      }),
    );
    return users;
  } catch (err) {
    throw new VError(err, "failed to fetch users");
  }
}

export async function getUser(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  userId: UserRecord.Id,
): Promise<Result.Type<UserRecord.UserRecord>> {
  const users = await getUsers(conn, ctx, serviceUser);
  const user = users.find(x => x.id === userId);
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
): Promise<boolean> {
  const users = await getUsers(conn, ctx, serviceUser);
  return users.find(x => x.id === userId) !== undefined;
}
