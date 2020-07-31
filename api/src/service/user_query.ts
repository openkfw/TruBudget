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
): Promise<Result.Type<UserRecord.UserRecord[]>> {
  const usersResult = await Cache.withCache(conn, ctx, async (cache) =>
    UserGet.getAllUsers(ctx, serviceUser, {
      getUserEvents: async () => {
        return cache.getUserEvents();
      },
    }),
  );
  return Result.mapErr(usersResult, (err) => new VError(err, `could not fetch users`));
}

export async function getUser(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  userId: UserRecord.Id,
): Promise<Result.Type<UserRecord.UserRecord>> {
  const usersResult = await getUsers(conn, ctx, serviceUser);
  if (Result.isErr(usersResult)) {
    return new VError(usersResult, `could not fetch users`);
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
  const usersResult = await getUsers(conn, ctx, serviceUser);
  if (Result.isErr(usersResult)) {
    return new VError(usersResult, `could not fetch users`);
  }
  return usersResult.find((x) => x.id === userId) !== undefined;
}
