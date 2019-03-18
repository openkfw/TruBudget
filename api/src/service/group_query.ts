import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { NotFound } from "./domain/errors/not_found";
import * as Group from "./domain/organization/group";
import * as GroupGet from "./domain/organization/group_get";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserRecord from "./domain/organization/user_record";

// TODO move groups handling to domain layer + make sure the cache is only refreshed _once_

export async function getGroups(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Group.Group[]> {
  try {
    const groups = await Cache.withCache(conn, ctx, cache =>
      GroupGet.getAllGroups(ctx, serviceUser, {
        getGroupEvents: async () => {
          return cache.getGroupEvents();
        },
      }),
    );
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

/**
 * returns all users for given identity
 *  if identity is an user return it,
 *  else if identity is group resolve identities of the group
 */
export async function resolveUsers(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  identity: Identity,
  getGroupFn: typeof getGroup = getGroup,
  groupSet: Set<Group.Id> = new Set(),
): Promise<UserRecord.Id[]> {
  const groupResult = await getGroupFn(conn, ctx, serviceUser, identity);

  if (Result.isErr(groupResult)) {
    return [identity];
  }

  const users: UserRecord.Id[] = [];
  for (const member of groupResult.members) {
    // prevent infinite loop, in case group contains itself, and group-member loops
    if (!groupSet.has(member)) {
      groupSet.add(member);
      const resolvedUsers = await resolveUsers(
        conn,
        ctx,
        serviceUser,
        member,
        getGroupFn,
        groupSet,
      );
      users.push(...resolvedUsers);
    }
  }

  // make entries in array unique
  const userSet = new Set(users);

  return [...userSet];
}
