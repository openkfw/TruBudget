import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import * as GroupCreate from "./domain/organization/group_create";
import { ServiceUser } from "./domain/organization/service_user";
import { getGlobalPermissions } from "./global_permissions_get";
import { groupExists } from "./group_query";
import { store } from "./store";

export async function createGroup(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: GroupCreate.RequestData,
): Promise<void> {
  const { newEvents, errors } = await GroupCreate.createGroup(ctx, serviceUser, requestData, {
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
    groupExists: async groupId => groupExists(conn, ctx, serviceUser, groupId),
  });
  if (errors.length > 0) return Promise.reject(errors);
  if (!newEvents.length) {
    return Promise.reject(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
