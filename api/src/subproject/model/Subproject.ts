import { isAllowedToSeeEvent } from "../../authz/history";
import { getAllowedIntents, getUserAndGroups } from "../../authz/index";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { AllowedUserGroupsByIntent, People } from "../../authz/types";
import deepcopy from "../../lib/deepcopy";
import { asMapKey } from "../../multichain/Client";
import { MultichainClient } from "../../multichain/Client.h";
import { Event, throwUnsupportedEventVersion } from "../../multichain/event";

export interface SubprojectResource {
  log: Event[];
  allowedIntents: Intent[];
  data: Data;
}

export interface Data {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  description: string;
  amount: string;
  currency: string;
  assignee?: string;
}

const subprojectsGroupKey = "subprojects";

function subprojectKey(subprojectId: string): string[] {
  return [subprojectsGroupKey, subprojectId];
}

export async function publish(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  args: {
    intent: Intent;
    createdBy: string;
    creationTimestamp: Date;
    dataVersion: number; // integer
    data: object;
  },
): Promise<void> {
  const { intent, createdBy, creationTimestamp, dataVersion, data } = args;
  const event: Event = {
    key: subprojectId,
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion,
    data,
  };
  return multichain.getRpcClient().invoke("publish", projectId, subprojectKey(subprojectId), {
    json: event,
  });
}

export async function get(
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string,
  subprojectId?: string,
): Promise<SubprojectResource[]> {
  const queryKey = subprojectId !== undefined ? subprojectId : subprojectsGroupKey;

  const streamItems = await multichain.v2_readStreamItems(projectId, queryKey);
  const userAndGroups = await getUserAndGroups(token);
  const resourceMap = new Map<string, SubprojectResource>();
  const permissionsMap = new Map<string, AllowedUserGroupsByIntent>();

  for (const item of streamItems) {
    const event = item.data.json as Event;

    let resource = resourceMap.get(asMapKey(item));
    if (resource === undefined) {
      const result = handleCreate(event);
      if (result === undefined) {
        throw Error(`Failed to initialize resource: ${JSON.stringify(event)}.`);
      }
      resource = result.resource;
      permissionsMap.set(asMapKey(item), result.permissions);
    } else {
      // We've already encountered this subproject, so we can apply operations on it.
      const permissions = permissionsMap.get(asMapKey(item))!;
      const hasProcessedEvent =
        applyAssign(event, resource) ||
        applyClose(event, resource) ||
        applyGrantPermission(event, permissions) ||
        applyRevokePermission(event, permissions);
      if (!hasProcessedEvent) {
        throw Error(`I don't know how to handle this event: ${JSON.stringify(event)}.`);
      }
    }

    if (resource !== undefined) {
      // Save all events to the log for now; we'll filter them once we
      // know the final resource permissions.
      resource.log.push(event);
      resourceMap.set(asMapKey(item), resource);
    }
  }

  for (const [key, permissions] of permissionsMap.entries()) {
    const resource = resourceMap.get(key);
    if (resource !== undefined) {
      resource.allowedIntents = await getAllowedIntents(userAndGroups, permissions);
    }
  }

  const unfilteredResources = [...resourceMap.values()];

  // Subprojects the user is not allowed to see are simply left out of the response. The
  // remaining have their event log filtered according to what the user is entitled to
  // know.
  const allowedToSeeDataIntent: Intent = "subproject.viewSummary";
  const filteredResources = unfilteredResources
    .filter(resource => resource.allowedIntents.includes(allowedToSeeDataIntent))
    .map(resource => {
      // Filter event log according to the user permissions and the type of event:
      resource.log = resource.log.filter(event =>
        isAllowedToSeeEvent(resource.allowedIntents, event.intent),
      );
      return resource;
    });

  return filteredResources;
}

function handleCreate(
  event: Event,
): { resource: SubprojectResource; permissions: AllowedUserGroupsByIntent } | undefined {
  if (event.intent !== "project.createSubproject") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { subproject, permissions } = event.data;
      return {
        resource: {
          data: deepcopy(subproject),
          log: [], // event is added later
          allowedIntents: [], // is set later using permissionsMap
        },
        permissions: deepcopy(permissions),
      };
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyAssign(event: Event, resource: SubprojectResource): true | undefined {
  if (event.intent !== "subproject.assign") return;
  switch (event.dataVersion) {
    case 1: {
      const { userId } = event.data;
      resource.data.assignee = userId;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyClose(event: Event, resource: SubprojectResource): true | undefined {
  if (event.intent !== "subproject.close") return;
  switch (event.dataVersion) {
    case 1: {
      resource.data.status = "closed";
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyGrantPermission(
  event: Event,
  permissions: AllowedUserGroupsByIntent,
): true | undefined {
  if (event.intent !== "subproject.intent.grantPermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { userId, intent } = event.data;
      const permissionsForIntent: People = permissions[intent] || [];
      if (!permissionsForIntent.includes(userId)) {
        permissionsForIntent.push(userId);
      }
      permissions[intent] = permissionsForIntent;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyRevokePermission(
  event: Event,
  permissions: AllowedUserGroupsByIntent,
): true | undefined {
  if (event.intent !== "subproject.intent.revokePermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { userId, intent } = event.data;
      const permissionsForIntent: People = permissions[intent] || [];
      const userIndex = permissionsForIntent.indexOf(userId);
      if (userIndex !== -1) {
        // Remove the user from the array:
        permissionsForIntent.splice(userIndex, 1);
        permissions[intent] = permissionsForIntent;
      }
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

export async function getPermissions(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
): Promise<AllowedUserGroupsByIntent> {
  const streamItems = await multichain.v2_readStreamItems(projectId, subprojectId);
  let permissions: AllowedUserGroupsByIntent | undefined;
  for (const item of streamItems) {
    const event = item.data.json;
    if (permissions === undefined) {
      const result = handleCreate(event);
      if (result !== undefined) {
        permissions = result.permissions;
      } else {
        // skip event
      }
    } else {
      // Permissions has been initialized.
      const _hasProcessedEvent =
        applyGrantPermission(event, permissions) || applyRevokePermission(event, permissions);
    }
  }
  if (permissions === undefined) {
    throw { kind: "NotFound", what: `Subproject ${subprojectId} of project ${projectId}.` };
  }
  return permissions;
}

export async function areAllClosed(
  multichain: MultichainClient,
  projectId: string,
): Promise<boolean> {
  const streamItems = await multichain.v2_readStreamItems(projectId, subprojectsGroupKey);

  type statusType = string;
  const resultMap = new Map<string, statusType>();

  for (const item of streamItems) {
    const event = item.data.json;
    switch (event.intent) {
      case "project.createSubproject": {
        resultMap.set(asMapKey(item), event.data.workflowitem.status);
        break;
      }
      case "subproject.close": {
        resultMap.set(asMapKey(item), "closed");
        break;
      }
      default: {
        /* ignoring other events */
      }
    }
  }

  // const offendingItems: StreamKey[] = [];
  // for (const [keys, status] of resultMap.entries()) {
  //   if (status !== "closed") offendingItems.push(keys);
  // }

  for (const status of resultMap.values()) {
    if (status !== "closed") return false;
  }
  return true;
}

export async function isClosed(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
): Promise<boolean> {
  const streamItems = await multichain.v2_readStreamItems(projectId, subprojectId);

  for (const item of streamItems) {
    const event = item.data.json;
    switch (event.intent) {
      case "project.createSubproject": {
        if (event.data.workflowitem.status === "closed") {
          return true;
        }
        break;
      }
      case "subproject.close": {
        return true;
      }
      default: {
        /* ignoring other events */
      }
    }
  }

  return false;
}

// 00000000000000000000000000000000000000000000000000000000000000000000000000000000

// export const create = async (
//   multichain: MultichainClient,
//   token: AuthToken,
//   projectId: string,
//   data: SubprojectData,
//   permissions: AllowedUserGroupsByIntent,
// ): Promise<void> => {
//   const subprojectId = data.id;
//   const resource: SubprojectResource = {
//     data,
//     log: [
//       {
//         // not taken from data in case subprojects are created after the fact, as
//         // the log entry's ctime should always be the actual time of creation:
//         creationUnixTs: Date.now().toString(),
//         issuer: token.userId,
//         action: "subproject_created",
//       },
//     ],
//     permissions,
//   };
//   return multichain.setValue(projectId, [SUBPROJECTS_KEY, subprojectId], resource);
// };

// export const getForUser = async (
//   multichain: MultichainClient,
//   token: AuthToken,
//   projectId: string,
//   subprojectId: string,
// ): Promise<SubprojectDataWithIntents> => {
//   const streamItem = await multichain.getValue(projectId, subprojectId);
//   const resource = streamItem.resource;
//   return {
//     ...resource.data,
//     allowedIntents: await getUserAndGroups(token).then(userAndGroups =>
//       getAllowedIntents(userAndGroups, resource.permissions),
//     ),
//   };
// };

// export const getAllForUser = async (
//   multichain: MultichainClient,
//   token: AuthToken,
//   projectId: string,
// ): Promise<SubprojectDataWithIntents[]> => {
//   const resources = await getAll(multichain, projectId);
//   const allSubprojects = await Promise.all(
//     resources.map(async resource => {
//       return {
//         ...resource.data,
//         allowedIntents: await getUserAndGroups(token).then(userAndGroups =>
//           getAllowedIntents(userAndGroups, resource.permissions),
//         ),
//       };
//     }),
//   );
//   const allowedToSeeIntents: Intent[] = ["subproject.viewSummary", "subproject.viewDetails"];
//   const clearedSubprojects = allSubprojects.filter(subproject =>
//     subproject.allowedIntents.some(intent => allowedToSeeIntents.includes(intent)),
//   );
//   return clearedSubprojects;
// };
