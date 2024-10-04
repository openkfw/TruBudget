import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as Group from "./domain/organization/group";
import * as GroupMemberAdd from "./domain/organization/group_member_add";
import { ServiceUser } from "./domain/organization/service_user";
import { store } from "./store";

export async function addMembers(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
  newMembers: Group.Member[],
): Promise<Result.Type<void>> {
  logger.debug({ newMembers }, `Adding members to group "${groupId}"`);

  const memberAddResult = await Cache.withCache(conn, ctx, (cache) =>
    GroupMemberAdd.addMembers(ctx, serviceUser, groupId, newMembers, {
      getGroupEvents: async () => {
        return cache.getGroupEvents();
      },
    }),
  );
  if (Result.isErr(memberAddResult))
    return new VError(memberAddResult, "failed to add group member");
  const memberAddEvent = memberAddResult;

  await store(conn, ctx, memberAddEvent, serviceUser.address);
}
