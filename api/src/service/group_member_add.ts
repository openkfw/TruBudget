import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as Group from "./domain/organization/group";
import * as GroupMemberAdd from "./domain/organization/group_member_add";
import { ServiceUser } from "./domain/organization/service_user";
import { store } from "./store";

export async function addMember(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
  newMember: Group.Member,
): Promise<Result.Type<void>> {
  const memberAddResult = await Cache.withCache(conn, ctx, cache =>
    GroupMemberAdd.addMember(ctx, serviceUser, groupId, newMember, {
      getGroupEvents: async () => {
        return cache.getGroupEvents();
      },
    }),
  );
  if (Result.isErr(memberAddResult)) return new VError(memberAddResult, "failed to add group member");
  const memberAddEvent = memberAddResult;

  await store(conn, ctx, memberAddEvent);
}
