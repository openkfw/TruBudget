import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
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

export async function removeMember(
  ctx: Ctx,
  issuer: ServiceUser,
  groupId: Group.Id,
  newMember: Group.Member,
  repository: Repository,
): Promise<Result.Type<BusinessEvent>> {
  const groupEvents = await repository.getGroupEvents();
  const { groups } = sourceGroups(ctx, groupEvents);

  const group = groups.find(x => x.id === groupId);
  if (group === undefined) {
    return new NotFound(ctx, "group", groupId);
  }

  // Create the new event:
  const memberRemoved = GroupMemberRemoved.createEvent(ctx.source, issuer.id, groupId, newMember);
  if (Result.isErr(memberRemoved)) {
    return new VError(memberRemoved, "failed to create group member removed event");
  }
  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "group.removeUser";
    if (!Group.permits(group, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: group });
    }
  }

  // Check that the new event is indeed valid:
  const { errors } = sourceGroups(ctx, groupEvents.concat([memberRemoved]));
  if (errors.length > 0) {
    return new InvalidCommand(ctx, memberRemoved, errors);
  }

  return memberRemoved;
}
