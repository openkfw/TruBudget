/**
 * DEPRECATED - see index.ts
 */
import { getAllowedIntents, getUserAndGroups } from "../../authz";
import { onlyAllowedData } from "../../authz/history";
import Intent from "../../authz/intents";
import { AuthToken } from "../../authz/token";
import { AllowedUserGroupsByIntent, People } from "../../authz/types";
import deepcopy from "../../lib/deepcopy";
import { isNotEmpty } from "../../lib/emptyChecks";
import { inheritDefinedProperties } from "../../lib/inheritDefinedProperties";
import logger from "../../lib/logger";
import { asMapKey } from "../../multichain/Client";
import { MultichainClient } from "../../multichain/Client.h";
import { Event, throwUnsupportedEventVersion } from "../../multichain/event";
import * as Liststreamkeyitems from "../../multichain/responses/liststreamkeyitems";

export interface AugmentedEvent extends Event {
  snapshot: {
    displayName: string;
  };
}

export interface ProjectResource {
  log: AugmentedEvent[];
  allowedIntents: Intent[];
  data: Data;
}

export interface Data {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  assignee?: string;
  description: string;
  amount: string;
  currency: string;
  thumbnail: string;
}

export interface Update {
  displayName?: string;
  description?: string;
  amount?: string;
  currency?: string;
  thumbnail?: string;
}

const projectSelfKey = "self";

export async function publish(
  multichain: MultichainClient,
  projectId: string,
  args: {
    intent: Intent;
    createdBy: string;
    creationTimestamp: Date;
    dataVersion: number; // integer
    data: object;
  },
): Promise<Event> {
  const { intent, createdBy, creationTimestamp, dataVersion, data } = args;
  const event: Event = {
    key: projectId,
    intent,
    createdBy,
    createdAt: creationTimestamp.toISOString(),
    dataVersion,
    data,
  };
  const streamName = projectId;
  const streamItemKey = projectSelfKey;
  const streamItem = { json: event };

  const publishEvent = () => {
    logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
    return multichain
      .getRpcClient()
      .invoke("publish", streamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      logger.debug(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "project", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: err }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
}

async function fetchStreamItems(
  multichain: MultichainClient,
  projectId?: string,
): Promise<Liststreamkeyitems.Item[]> {
  if (projectId !== undefined) {
    return multichain.v2_readStreamItems(projectId, projectSelfKey);
  } else {
    // This fetches all the streams, keeping only project streams; then fetches the
    // project-stream's self key, which includes the actual project data, as stream
    // items.
    const streams = await multichain.streams();
    const streamItemLists = await Promise.all(
      streams
        .filter(stream => stream.details.kind === "project")
        .map(stream => stream.name)
        .map(streamName =>
          multichain
            .v2_readStreamItems(streamName, projectSelfKey)
            .then(items =>
              items.map(item => {
                // Make it possible to associate the "self" key to the actual project later on:
                item.keys = [streamName, projectSelfKey];
                return item;
              }),
            )
            .catch(err => {
              logger.error(
                { error: err },
                `Failed to fetch '${projectSelfKey}' stream item from project stream ${streamName}`,
              );
              return null;
            }),
        ),
    ).then(lists => lists.filter(isNotEmpty));
    // Remove failed attempts and flatten into a single list of stream items:
    return streamItemLists.reduce((acc, x) => acc.concat(x), []);
  }
}

export async function get(
  multichain: MultichainClient,
  token: AuthToken,
  projectId?: string,
  skipAuthorizationCheck?: "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!",
): Promise<ProjectResource[]> {
  const streamItems = await fetchStreamItems(multichain, projectId);
  const userAndGroups = await getUserAndGroups(token);
  const resourceMap = new Map<string, ProjectResource>();
  const permissionsMap = new Map<string, AllowedUserGroupsByIntent>();

  for (const item of streamItems) {
    const event = item.data.json as Event;
    let resource = resourceMap.get(asMapKey(item));
    if (resource === undefined) {
      const result = handleCreate(event);
      if (result === undefined) {
        const message = "Failed to initialize resource";
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
      resource = result.resource;
      permissionsMap.set(asMapKey(item), result.permissions);
    } else {
      // We've already encountered this project, so we can apply operations on it.
      const permissions = permissionsMap.get(asMapKey(item))!;
      const hasProcessedEvent =
        applyUpdate(event, resource) ||
        applyAssign(event, resource) ||
        applyClose(event, resource) ||
        applyGrantPermission(event, permissions) ||
        applyRevokePermission(event, permissions);
      if (!hasProcessedEvent) {
        const message = "Unexpected event";
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
    }

    if (resource !== undefined) {
      // Save all events to the log for now; we'll filter them once we
      // know the final resource permissions.
      resource.log.push({
        ...event,
        snapshot: { displayName: deepcopy(resource.data.displayName) },
      });
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

  if (
    skipAuthorizationCheck ===
    "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!"
  ) {
    return unfilteredResources;
  }

  // Projects the user is not allowed to see are simply left out of the response. The
  // remaining have their event log filtered according to what the user is entitled to
  // know.
  const allowedToSeeDataIntent: Intent = "project.viewSummary";
  const filteredResources = unfilteredResources
    .filter(resource => resource.allowedIntents.includes(allowedToSeeDataIntent))
    .map(resource => {
      // Filter event log according to the user permissions and the type of event:
      resource.log = resource.log
        .map(event => onlyAllowedData(event, resource.allowedIntents) as AugmentedEvent | null)
        .filter(isNotEmpty);
      return resource;
    });

  return filteredResources;
}

function handleCreate(
  event: Event,
): { resource: ProjectResource; permissions: AllowedUserGroupsByIntent } | undefined {
  if (event.intent !== "global.createProject") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { project, permissions } = event.data;
      return {
        resource: {
          data: deepcopy(project),
          log: [], // event is added later
          allowedIntents: [], // is set later using permissionsMap
        },
        permissions: deepcopy(permissions),
      };
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyUpdate(event: Event, resource: ProjectResource): true | undefined {
  if (event.intent !== "project.update") return;
  switch (event.dataVersion) {
    case 1: {
      const update: Update = event.data;
      inheritDefinedProperties(resource.data, update);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyAssign(event: Event, resource: ProjectResource): true | undefined {
  if (event.intent !== "project.assign") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity } = event.data;
      resource.data.assignee = identity;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyClose(event: Event, resource: ProjectResource): true | undefined {
  if (event.intent !== "project.close") return;
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
  if (event.intent !== "project.intent.grantPermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      const permissionsForIntent: People = permissions[intent] || [];
      if (!permissionsForIntent.includes(identity)) {
        permissionsForIntent.push(identity);
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
  if (event.intent !== "project.intent.revokePermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      const permissionsForIntent: People = permissions[intent] || [];
      const userIndex = permissionsForIntent.indexOf(identity);
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
): Promise<AllowedUserGroupsByIntent> {
  const streamItems = await fetchStreamItems(multichain, projectId);
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
    throw { kind: "NotFound", what: `Project ${projectId}.` };
  }
  return permissions;
}

export async function areAllClosed(multichain: MultichainClient): Promise<boolean> {
  const streamItems = await fetchStreamItems(multichain);

  type statusType = string;
  const resultMap = new Map<string, statusType>();

  for (const item of streamItems) {
    const event = item.data.json;
    switch (event.intent) {
      case "global.createProject": {
        resultMap.set(asMapKey(item), event.data.workflowitem.status);
        break;
      }
      case "project.close": {
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

export async function isClosed(multichain: MultichainClient, projectId: string): Promise<boolean> {
  const streamItems = await fetchStreamItems(multichain, projectId);

  for (const item of streamItems) {
    const event = item.data.json;
    switch (event.intent) {
      case "global.createProject": {
        if (event.data.project.status === "closed") {
          return true;
        }
        break;
      }
      case "project.close": {
        return true;
      }
      default: {
        /* ignoring other events */
      }
    }
  }

  return false;
}
