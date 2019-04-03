import { Ctx } from "../../../lib/ctx";
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

export async function addMember(
  ctx: Ctx,
  issuer: ServiceUser,
  groupId: Group.Id,
  newMember: Group.Member,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
  const groupEvents = await repository.getGroupEvents();
  const { groups } = sourceGroups(ctx, groupEvents);

  const group = groups.find(x => x.id === groupId);
  if (group === undefined) {
    return { newEvents: [], errors: [new NotFound(ctx, "group", groupId)] };
  }

  // Create the new event:
  const memberAdded = GroupMemberAdded.createEvent(ctx.source, issuer.id, groupId, newMember);

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "group.addUser";
    if (!Group.permits(group, issuer, [intent])) {
      return {
        newEvents: [],
        errors: [new NotAuthorized({ ctx, userId: issuer.id, intent, target: group })],
      };
    }
  }

  // Check that the new event is indeed valid:
  const { errors } = sourceGroups(ctx, groupEvents.concat([memberAdded]));
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, memberAdded, errors)] };
  }

  return { newEvents: [memberAdded], errors: [] };
}
