import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { ConnToken } from "../../conn";
import { NotFound } from "../errors/not_found";

import * as Cache from "./../../cache2";
import * as Group from "./group";
import * as GroupGet from "./group_get";
import { Identity } from "./identity";
import { ServiceUser } from "./service_user";
import { getUser } from "./user_query";
import * as UserRecord from "./user_record";

export async function getGroups(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Result.Type<Group.Group[]>> {
  logger.debug("Getting all groups");

  try {
    const groups = await Cache.withCache(conn, ctx, (cache) =>
      GroupGet.getAllGroups(ctx, serviceUser, {
        getGroupEvents: async () => {
          return cache.getGroupEvents();
        },
      }),
    );
    return groups;
  } catch (err) {
    return new VError(err, "failed to fetch groups");
  }
}

export async function getGroup(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
): Promise<Result.Type<Group.Group>> {
  logger.debug(`Getting group with id "${groupId}"`);

  const groupsResult = await getGroups(conn, ctx, serviceUser);

  if (Result.isErr(groupsResult)) return groupsResult;

  const groups = groupsResult;
  const group = groups.find((x) => x.id === groupId);

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
): Promise<Result.Type<Group.Group[]>> {
  logger.debug({ user: targetUserId }, "Get groups for user");

  const groupsResult = await getGroups(conn, ctx, serviceUser);

  if (Result.isErr(groupsResult)) return groupsResult;

  const groups = groupsResult;

  return groups.filter((group) => group.members.includes(targetUserId));
}

export async function groupExists(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  groupId: Group.Id,
): Promise<Result.Type<boolean>> {
  logger.debug({ groupId }, "Checking if group exists");
  const groupsResult = await getGroups(conn, ctx, serviceUser);

  if (Result.isErr(groupsResult)) return groupsResult;

  const groups = groupsResult;
  return groups.find((x) => x.id === groupId) !== undefined;
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
  getUserFn: typeof getUser = getUser,
  groupSet: Set<Group.Id> = new Set(),
): Promise<Result.Type<UserRecord.Id[]>> {
  logger.debug({ identity }, "Getting all users of group");
  const groupResult = await getGroupFn(conn, ctx, serviceUser, identity);

  // if assignee is not a group, it is probably a user
  if (Result.isErr(groupResult)) {
    //check if assignee does exist
    logger.debug({ identity }, "Identity is not a group, checking if it is a user");

    const userResult = await getUserFn(conn, ctx, serviceUser, identity);
    if (Result.isErr(userResult)) {
      return new NotFound(ctx, "user", identity);
    }

    logger.debug({ user: userResult }, "Identity is a user");
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
        getUserFn,
        groupSet,
      );

      if (Result.isErr(resolvedUsers)) {
        return new VError(resolvedUsers, "resolve users failed");
      } else {
        users.push(...resolvedUsers);
      }
    }
  }

  // make entries in array unique
  const userSet = new Set(users);

  return [...userSet];
}
