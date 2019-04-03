import { Ctx } from "../../../lib/ctx";
import deepcopy from "../../../lib/deepcopy";
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
    apply(ctx, groups, event, errors);
  }
  return { groups: [...groups.values()], errors };
}

function apply(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  event: BusinessEvent,
  errors: EventSourcingError[],
) {
  if (event.type === "group_created") {
    handleGroupCreated(ctx, groups, event, errors);
  } else if (event.type === "group_member_added") {
    applyMemberAdded(ctx, groups, event, errors);
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
) {
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

function applyMemberAdded(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  memberAdded: GroupMemberAdded.Event,
  errors: EventSourcingError[],
) {
  const group = deepcopy(groups.get(memberAdded.groupId));
  if (group === undefined) return;

  if (group.members.includes(memberAdded.newMember)) {
    return;
  }

  group.members.push(memberAdded.newMember);

  const result = Group.validate(group);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: memberAdded }, result));
    return;
  }

  const traceEvent: GroupTraceEvent = {
    entityId: memberAdded.groupId,
    entityType: "group",
    businessEvent: memberAdded,
    snapshot: {
      displayName: group.displayName,
    },
  };
  group.log.push(traceEvent);

  groups.set(memberAdded.groupId, group);
}

function applyMemberRemoved(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  memberRemoved: GroupMemberRemoved.Event,
  errors: EventSourcingError[],
) {
  const group = deepcopy(groups.get(memberRemoved.groupId));
  if (group === undefined) return;

  const memberIdx = group.members.indexOf(memberRemoved.member);
  if (memberIdx === -1) {
    // The "member" already doesn't belong to this group, so there's nothing left to do.
    return;
  }
  // Remove the user from the array:
  group.members.splice(memberIdx, 1);

  const result = Group.validate(group);
  if (Result.isErr(result)) {
    errors.push(new EventSourcingError({ ctx, event: memberRemoved }, result));
    return;
  }

  const traceEvent: GroupTraceEvent = {
    entityId: memberRemoved.groupId,
    entityType: "group",
    businessEvent: memberRemoved,
    snapshot: {
      displayName: group.displayName,
    },
  };
  group.log.push(traceEvent);

  groups.set(memberRemoved.groupId, group);
}

function applyPermissionGranted(
  ctx: Ctx,
  groups: Map<Group.Id, Group.Group>,
  permissionGranted: GroupPermissionGranted.Event,
  errors: EventSourcingError[],
) {
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
) {
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
