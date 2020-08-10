import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as Group from "./domain/organization/group";
import * as GroupMemberRemove from "./domain/organization/group_member_remove";
import { ServiceUser } from "./domain/organization/service_user";
import { store } from "./store";

export async function removeMember(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
  newMember: Group.Member,
): Promise<Result.Type<void>> {
  const memberRemoveResult = await Cache.withCache(conn, ctx, cache =>
    GroupMemberRemove.removeMember(ctx, serviceUser, groupId, newMember, {
      getGroupEvents: async () => {
        return cache.getGroupEvents();
      },
    }),
  );

  if (Result.isErr(memberRemoveResult)) return new VError(memberRemoveResult, "failed to remove group member");
  const memberAddEvent = memberRemoveResult;

  await store(conn, ctx, memberAddEvent);
}
