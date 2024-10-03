import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";

import * as Group from "./group";
import { sourceGroups } from "./group_eventsourcing";
import * as GroupMemberRemoved from "./group_member_removed";

interface Repository {
  getGroupEvents(): Promise<BusinessEvent[]>;
}

export async function removeMembers(
  ctx: Ctx,
  issuer: ServiceUser,
  groupId: Group.Id,
  members: Group.Member[],
  repository: Repository,
): Promise<Result.Type<BusinessEvent>> {
  const groupEvents = await repository.getGroupEvents();
  const { groups } = sourceGroups(ctx, groupEvents);

  const group = groups.find((x) => x.id === groupId);
  if (group === undefined) {
    return new NotFound(ctx, "group", groupId);
  }

  logger.trace({ groupId, issuer }, "Creating GroupMemberRemoved Event");
  const memberRemoved = GroupMemberRemoved.createEvent(
    ctx.source,
    issuer.id,
    groupId,
    members,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(memberRemoved)) {
    return new VError(memberRemoved, "failed to create group member removed event");
  }

  logger.trace({ issuer }, "Checking if user is root or has permissions");
  if (issuer.id !== "root") {
    const intent = "group.removeUser";
    if (!Group.permits(group, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: group });
    }
  }

  logger.trace({ memberRemoved }, "Checking if event is valid");
  const { errors } = sourceGroups(ctx, groupEvents.concat([memberRemoved]));
  if (errors.length > 0) {
    return new InvalidCommand(ctx, memberRemoved, errors);
  }

  return memberRemoved;
}
