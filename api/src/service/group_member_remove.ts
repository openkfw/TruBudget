import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import * as Group from "./domain/organization/group";
import * as GroupMemberRemove from "./domain/organization/group_member_remove";
import { ServiceUser } from "./domain/organization/service_user";
import { loadGroupEvents } from "./load";
import { store } from "./store";

const GROUPS_STREAM = "groups";

export async function removeMember(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
  newMember: Group.Member,
): Promise<void> {
  const { newEvents, errors } = await GroupMemberRemove.removeMember(
    ctx,
    serviceUser,
    groupId,
    newMember,
    {
      getGroupEvents: async () => loadGroupEvents(conn),
    },
  );
  if (errors.length > 0) return Promise.reject(errors);

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
