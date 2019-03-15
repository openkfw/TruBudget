import { Ctx } from "../lib/ctx";
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
): Promise<void> {
  const { newEvents, errors } = await Cache.withCache(conn, ctx, cache =>
    GroupMemberAdd.addMember(ctx, serviceUser, groupId, newMember, {
      getGroupEvents: async () => {
        return cache.getGroupEvents();
      },
    }),
  );
  if (errors.length > 0) return Promise.reject(errors);

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
