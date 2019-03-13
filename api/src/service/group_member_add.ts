import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import * as Group from "./domain/organization/group";
import * as GroupMemberAdd from "./domain/organization/group_member_add";
import { ServiceUser } from "./domain/organization/service_user";
import { loadGroupEvents } from "./load";
import { store } from "./store";

const GROUPS_STREAM = "groups";

export async function addMember(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
  newMember: Group.Member,
): Promise<void> {
  const { newEvents, errors } = await GroupMemberAdd.addMember(
    ctx,
    serviceUser,
    groupId,
    newMember,
    {
      getGroupEvents: async () => loadGroupEvents(conn),
    },
  );
  if (errors.length > 0) return Promise.reject(errors);
  if (!newEvents.length) {
    return Promise.reject(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
