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
import * as GroupMemberAdded from "./group_member_added";

interface Repository {
  getGroupEvents(): Promise<BusinessEvent[]>;
}

export async function addMembers(
  ctx: Ctx,
  issuer: ServiceUser,
  groupId: Group.Id,
  newMembers: Group.Member[],
  repository: Repository,
): Promise<Result.Type<BusinessEvent>> {
  const groupEvents = await repository.getGroupEvents();
  const { groups } = sourceGroups(ctx, groupEvents);

  logger.trace({ groupId }, "Checking if group exists");
  const group = groups.find((x) => x.id === groupId);
  if (group === undefined) {
    return new NotFound(ctx, "group", groupId);
  }

  logger.trace("Creating new GroupMemberAdded event");
  const membersAdded = GroupMemberAdded.createEvent(
    ctx.source,
    issuer.id,
    groupId,
    newMembers,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(membersAdded)) {
    return new VError(membersAdded, "failed to create group added event");
  }

  logger.trace({ issuer }, "Checking if user is root or has permissions");
  if (issuer.id !== "root") {
    const intent = "group.addUser";
    if (!Group.permits(group, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: group });
    }
  }

  logger.trace("Checking that the groupEvents are valid");
  const { errors } = sourceGroups(ctx, groupEvents.concat([membersAdded]));
  if (errors.length > 0) {
    return new InvalidCommand(ctx, membersAdded, errors);
  }

  return membersAdded;
}
