import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { NotFound } from "./domain/errors/not_found";
import * as Group from "./domain/organization/group";
import * as GroupGet from "./domain/organization/group_get";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";

const GROUPS_STREAM = "users";

export async function getGroups(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Group.Group[]> {
  try {
    const groups = await GroupGet.getAllGroups(ctx, serviceUser, {
      getGroupEvents: async () => {
        await Cache2.refresh(conn);
        return conn.cache2.eventsByStream.get(GROUPS_STREAM) || [];
      },
    });
    return groups;
  } catch (err) {
    throw new VError(err, "failed to fetch groups");
  }
}

export async function getGroup(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
): Promise<Result.Type<Group.Group>> {
  const groups = await getGroups(conn, ctx, serviceUser);
  const group = groups.find(x => x.id === groupId);
  if (group === undefined) {
    return new NotFound(ctx, "group", groupId);
  }
  return group;
}

export async function getGroupsForUser(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  targetUserId: Identity,
): Promise<Group.Group[]> {
  const groups = await getGroups(conn, ctx, serviceUser);
  return groups.filter(group => group.members.includes(targetUserId));
}

export async function groupExists(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
): Promise<boolean> {
  const groups = await getGroups(conn, ctx, serviceUser);
  return groups.find(x => x.id === groupId) !== undefined;
}
