import { Ctx } from "../../../lib/ctx";
import deepcopy from "../../../lib/deepcopy";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { EventSourcingError } from "../errors/event_sourcing_error";

import * as Group from "./group";
import * as GroupCreated from "./group_created";
import * as GroupMemberAdded from "./group_member_added";
import * as GroupMemberRemoved from "./group_member_removed";
import * as GroupPermissionGranted from "./group_permissions_granted";
import * as GroupPermissionRevoked from "./group_permissions_revoked";
import { GroupTraceEvent } from "./group_trace_event";

export function sourceGroups(
  ctx: Ctx,
  events: BusinessEvent[],
): { groups: Group.Group[]; errors: EventSourcingError[] } {
  const groups = new Map<Group.Id, Group.Group>();
  const errors: EventSourcingError[] = [];
  for (const event of events) {
    logger.trace({ event }, "Validating group Event by applying it");
    apply(ctx, groups, event, errors);
  }
  return { groups: [...groups.values()], errors };
}

function apply(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  event: BusinessEvent,
  errors: EventSourcingError[],
): void {
  if (event.type === "group_created") {
    handleGroupCreated(ctx, groups, event, errors);
  } else if (event.type === "group_member_added") {
    applyMembersAdded(ctx, groups, event, errors);
  } else if (event.type === "group_member_removed") {
    applyMemberRemoved(ctx, groups, event, errors);
  } else if (event.type === "group_permissions_granted") {
    applyPermissionGranted(ctx, groups, event, errors);
  } else if (event.type === "group_permissions_revoked") {
    applyPermissionRevoked(ctx, groups, event, errors);
  }
}

function handleGroupCreated(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  groupCreated: GroupCreated.Event,
  errors: EventSourcingError[],
): void {
  const initialData = groupCreated.group;

  let group = groups.get(initialData.id);
  if (group !== undefined) return;

  group = {
    id: initialData.id,
    createdAt: groupCreated.time,
    displayName: initialData.displayName,
    description: initialData.description,
    members: initialData.members,
    permissions: initialData.permissions,
    log: [],
    additionalData: initialData.additionalData,
  };

  const result = Group.validate(group);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: groupCreated }, result));
    return;
  }

  const traceEvent: GroupTraceEvent = {
    entityId: initialData.id,
    entityType: "group",
    businessEvent: groupCreated,
    snapshot: {
      displayName: group.displayName,
    },
  };
  group.log.push(traceEvent);

  groups.set(initialData.id, group);
}

function applyMembersAdded(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  membersAdded: GroupMemberAdded.Event,
  errors: EventSourcingError[],
): void {
  logger.trace("Adding member to group...");
  // newMembers are member that are currently not in the group
  let newMembers: string[] = [];
  const group = deepcopy(groups.get(membersAdded.groupId));
  if (group === undefined) return;

  newMembers = membersAdded.newMembers.filter((member) => !group.members.includes(member));

  if (newMembers.length === 0) {
    return;
  }

  group.members.push(...newMembers);

  const result = Group.validate(group);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: membersAdded }, result));
    return;
  }

  const traceEvent: GroupTraceEvent = {
    entityId: membersAdded.groupId,
    entityType: "group",
    businessEvent: membersAdded,
    snapshot: {
      displayName: group.displayName,
    },
  };
  group.log.push(traceEvent);

  groups.set(membersAdded.groupId, group);
}

function applyMemberRemoved(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  membersRemoved: GroupMemberRemoved.Event,
  errors: EventSourcingError[],
): void {
  logger.trace("Remove member from group...");
  const group = deepcopy(groups.get(membersRemoved.groupId));
  if (group === undefined) return;

  group.members = group.members.filter((currentGroupMember) => {
    return !membersRemoved.members.includes(currentGroupMember);
  });

  const result = Group.validate(group);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: membersRemoved }, result));
    return;
  }
  logger.trace("Publishing member removal ...");

  const traceEvent: GroupTraceEvent = {
    entityId: membersRemoved.groupId,
    entityType: "group",
    businessEvent: membersRemoved,
    snapshot: {
      displayName: group.displayName,
    },
  };
  group.log.push(traceEvent);

  groups.set(membersRemoved.groupId, group);
}

function applyPermissionGranted(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  permissionGranted: GroupPermissionGranted.Event,
  errors: EventSourcingError[],
): void {
  logger.trace("Applying group permissions ...");

  const group = deepcopy(groups.get(permissionGranted.groupId));
  if (group === undefined) return;

  const eligibleIdentities = group.permissions[permissionGranted.permission] || [];
  if (!eligibleIdentities.includes(permissionGranted.grantee)) {
    eligibleIdentities.push(permissionGranted.grantee);
  }
  group.permissions[permissionGranted.permission] = eligibleIdentities;

  const result = Group.validate(group);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: permissionGranted }, result));
    return;
  }
  logger.trace("Publishing group permissions ...");

  const traceEvent: GroupTraceEvent = {
    entityId: permissionGranted.groupId,
    entityType: "group",
    businessEvent: permissionGranted,
    snapshot: {
      displayName: group.displayName,
    },
  };
  group.log.push(traceEvent);

  groups.set(permissionGranted.groupId, group);
}

function applyPermissionRevoked(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  permissionRevoked: GroupPermissionRevoked.Event,
  errors: EventSourcingError[],
): void {
  logger.trace("Applying group permissions revoke ...");

  const group = deepcopy(groups.get(permissionRevoked.groupId));
  if (group === undefined) return;

  const eligibleIdentities = group.permissions[permissionRevoked.permission];
  if (eligibleIdentities !== undefined) {
    const foundIndex = eligibleIdentities.indexOf(permissionRevoked.revokee);
    const hasPermission = foundIndex !== -1;
    if (hasPermission) {
      // Remove the identity from the array:
      eligibleIdentities.splice(foundIndex, 1);
    }
  }

  const result = Group.validate(group);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: permissionRevoked }, result));
    return;
  }
  logger.trace("Publishing group permissions revoke...");

  const traceEvent: GroupTraceEvent = {
    entityId: permissionRevoked.groupId,
    entityType: "group",
    businessEvent: permissionRevoked,
    snapshot: {
      displayName: group.displayName,
    },
  };
  group.log.push(traceEvent);

  groups.set(permissionRevoked.groupId, group);
}
