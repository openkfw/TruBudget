import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import * as GroupCreate from "./domain/organization/group_create";
import { sourceGroups } from "./domain/organization/group_eventsourcing";
import { groupExists } from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import { userExists } from "./domain/organization/user_query";
import { getGlobalPermissions } from "./global_permissions_get";
import { store } from "./store";

interface Group {
  id: string;
  displayName: string;
  users: string[];
}

export async function createGroup(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: GroupCreate.RequestData,
): Promise<Result.Type<Group>> {
  logger.debug({ req: requestData }, "Creating Group");

  const groupCreateResult = await GroupCreate.createGroup(ctx, serviceUser, requestData, {
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
    groupExists: async (groupId) => groupExists(conn, ctx, serviceUser, groupId),
    userExists: async (groupId) => userExists(conn, ctx, serviceUser, groupId),
  });

  if (Result.isErr(groupCreateResult)) return new VError(groupCreateResult, "create group failed");
  const newEvents = groupCreateResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  const { groups } = sourceGroups(ctx, newEvents);
  if (groups.length !== 1) {
    return new Error(
      `Expected new events to yield exactly one group, got: ${JSON.stringify(groups)}`,
    );
  }

  const newGroup: Group = {
    id: groups[0].id,
    displayName: groups[0].displayName,
    users: groups[0].members,
  };

  return newGroup;
}
