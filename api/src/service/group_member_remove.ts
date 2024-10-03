import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as Group from "./domain/organization/group";
import * as GroupMemberRemove from "./domain/organization/group_member_remove";
import { ServiceUser } from "./domain/organization/service_user";
import { store } from "./store";

export async function removeMembers(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
  userIds: Group.Member[],
): Promise<Result.Type<void>> {
  logger.debug({ userIds }, "Removing users from group");

  const memberRemoveResult = await Cache.withCache(conn, ctx, (cache) =>
    GroupMemberRemove.removeMembers(ctx, serviceUser, groupId, userIds, {
      getGroupEvents: async () => {
        return cache.getGroupEvents();
      },
    }),
  );

  if (Result.isErr(memberRemoveResult))
    return new VError(memberRemoveResult, "failed to remove group member");
  const memberAddEvent = memberRemoveResult;

  await store(conn, ctx, memberAddEvent, serviceUser.address);
}
