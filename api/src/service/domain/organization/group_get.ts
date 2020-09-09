import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { NotFound } from "../errors/not_found";
import * as Group from "./group";
import { sourceGroups } from "./group_eventsourcing";
import { ServiceUser } from "./service_user";

interface Repository {
  getGroupEvents(): Promise<BusinessEvent[]>;
}

export async function getOneGroup(
  ctx: Ctx,
  user: ServiceUser,
  groupId: Group.Id,
  repository: Repository,
): Promise<Result.Type<Group.Group>> {
  const allEvents = await repository.getGroupEvents();
  // Errors are ignored here:
  const { groups } = sourceGroups(ctx, allEvents);

  const group = groups.find(x => x.id === groupId);
  if (group === undefined) {
    return Promise.reject(new NotFound(ctx, "group", groupId));
  }

  // If there would be permissions required for viewing a group, the authorization check
  // would be done here.

  return group;
}

export async function getAllGroups(
  ctx: Ctx,
  user: ServiceUser,
  repository: Repository,
): Promise<Group.Group[]> {
  const allEvents = await repository.getGroupEvents();
  // Errors are ignored here:
  const { groups } = sourceGroups(ctx, allEvents);

  // If there would be permissions required for viewing a group, the authorization check
  // would be used here to filter the groups accordingly.

  return groups;
}
