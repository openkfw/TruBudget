import uuid = require("uuid");

import Intent from "../authz/intents";
import { People, Permissions } from "../authz/types";
import deepcopy from "../lib/deepcopy";
import { isNotEmpty } from "../lib/emptyChecks";
import { inheritDefinedProperties } from "../lib/inheritDefinedProperties";
import logger from "../lib/logger";
import { MultichainClient } from "./Client.h";
import { ConnToken } from "./conn";
import { Event, throwUnsupportedEventVersion } from "./event";
import { Issuer } from "./issuer";
import * as Liststreamkeyitems from "./liststreamkeyitems";
import { Item } from "./liststreamkeyitems";

type ResourceType = "project" | "subproject" | "workflowitem";

const projectSelfKey = "self";

interface NotificationResourceDescription {
  id: string;
  type: ResourceType;
}

interface ProjectedBudget {
  organization: string;
  value: string;
  currencyCode: string;
}

export interface Project {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  assignee?: string;
  description: string;
  projectedBudgets: ProjectedBudget[];
  thumbnail: string;
  permissions: Permissions;
  log: HistoryEvent[];
}

export interface ProjectUpdate {
  displayName?: string;
  description?: string;
  projectedBudget?: ProjectedBudget[];
  thumbnail?: string;
}

export interface HistoryEvent {
  key: string; // the resource ID (same for all events that relate to the same resource)
  intent: Intent;
  createdBy: string;
  createdAt: string;
  dataVersion: number; // integer
  data: any;
  snapshot: {
    displayName: string;
  };
}

export async function createProjectOnChain(
  conn: ConnToken,
  issuer: Issuer,
  project: Project,
): Promise<void> {
  const intent: Intent = "global.createProject";

  const { permissions, ...metadata } = project;

  const event: Event = {
    key: project.id,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: {
      project: metadata,
      permissions,
    },
  };

  const streamName = project.id;
  const streamItemKey = projectSelfKey;
  const streamItem = { json: event };

  const publishEvent = () => {
    logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
    return conn.multichainClient
      .getRpcClient()
      .invoke("publish", streamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return conn.multichainClient
    .getOrCreateStream({ kind: "project", name: streamName })
    .then(() => publishEvent());
}

export async function writeProjectAssignedToChain(
  conn: ConnToken,
  issuer: Issuer,
  projectId: string,
  assignee: string,
): Promise<void> {
  const intent: Intent = "project.assign";
  const event = {
    key: projectId,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: { identity: assignee },
  };

  const streamName = projectId;
  const streamItemKey = "self";
  const streamItem = { json: event };

  logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
  return conn.multichainClient
    .getRpcClient()
    .invoke("publish", streamName, streamItemKey, streamItem)
    .then(() => event);
}

export interface ProjectUpdate {
  displayName?: string;
  description?: string;
  projectedBudgets?: ProjectedBudget[];
  thumbnail?: string;
}

export async function updateProject(
  conn: ConnToken,
  issuer: Issuer,
  projectId: string,
  update: ProjectUpdate,
): Promise<void> {
  const intent: Intent = "project.update";

  const event = {
    key: projectId,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: update,
  };

  const streamName = projectId;
  const streamItemKey = projectSelfKey;
  const streamItem = { json: event };

  logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
  return conn.multichainClient
    .getRpcClient()
    .invoke("publish", streamName, streamItemKey, streamItem)
    .then(() => event);
}

export async function getProject(conn: ConnToken, id: string): Promise<Project> {
  const streamItems = await fetchStreamItems(conn.multichainClient, id);
  const projectsMap = applyStreamItems(streamItems);
  const project = projectsMap.get(id);

  if (project === undefined) {
    throw Error(`Failed to source project ${id}`);
  }

  return project;
}

export async function getProjectList(conn: ConnToken): Promise<Project[]> {
  const streamItems = await fetchStreamItems(conn.multichainClient);
  const projectsMap = applyStreamItems(streamItems);
  return [...projectsMap.values()];
}

export async function getProjectPermissionList(
  conn: ConnToken,
  projectId: string,
): Promise<Permissions> {
  const project = await getProject(conn, projectId);
  return project.permissions;
}

export async function grantProjectPermission(
  conn: ConnToken,
  issuer: Issuer,
  projectId: string,
  grantee: string,
  intent: Intent,
): Promise<void> {
  const grantIntent: Intent = "project.intent.grantPermission";

  const event = {
    key: projectId,
    intent: grantIntent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: { identity: grantee, intent },
  };

  const streamName = projectId;
  const streamItemKey = projectSelfKey;
  const streamItem = { json: event };

  logger.debug(`Publishing ${grantIntent} to ${streamName}/${streamItemKey}`);
  return conn.multichainClient
    .getRpcClient()
    .invoke("publish", streamName, streamItemKey, streamItem)
    .then(() => event);
}

export function applyStreamItems(
  streamItems: Item[],
  projectsByName: Map<string, Project> = new Map<string, Project>(),
): Map<string, Project> {
  for (const item of streamItems) {
    const event = item.data.json as Event;
    const projectId = event.key;
    let project = projectsByName.get(projectId);
    if (project === undefined) {
      project = handleCreate(event);
    } else {
      const hasProcessedEvent =
        applyUpdate(event, project) ||
        applyAssign(event, project) ||
        applyClose(event, project) ||
        applyGrantPermission(event, project) ||
        applyRevokePermission(event, project);
      if (!hasProcessedEvent) {
        throw Error(`Unexpected event: ${JSON.stringify(event)}.`);
      }
    }
    // There may be alien items in the list, so project might still be undefined here:
    if (project !== undefined) {
      project.log.push({
        ...event,
        snapshot: { displayName: deepcopy(project.displayName) },
      });
      projectsByName.set(projectId, project);
    }
  }
  return projectsByName;
}

async function fetchStreamItems(
  multichainClient: MultichainClient,
  projectId?: string,
): Promise<Liststreamkeyitems.Item[]> {
  if (projectId !== undefined) {
    return multichainClient.v2_readStreamItems(projectId, projectSelfKey);
  } else {
    // This fetches all the streams, keeping only project streams; then fetches the
    // project-stream's self key, which includes the actual project data, as stream
    // items.
    const streams = await multichainClient.streams();
    const streamItemLists = await Promise.all(
      streams
        .filter((stream) => stream.details.kind === "project")
        .map((stream) => stream.name)
        .map((streamName) =>
          multichainClient
            .v2_readStreamItems(streamName, projectSelfKey)
            .then((items) =>
              items.map((item) => {
                // Make it possible to associate the "self" key to the actual project later on:
                item.keys = [streamName, projectSelfKey];
                return item;
              }),
            )
            .catch((err) => {
              logger.error(
                { error: err },
                `Failed to fetch '${projectSelfKey}' stream item from project stream ${streamName}`,
              );
              return null;
            }),
        ),
    ).then((lists) => lists.filter(isNotEmpty));
    // Remove failed attempts and flatten into a single list of stream items:
    return streamItemLists.reduce((acc, x) => acc.concat(x), []);
  }
}

function handleCreate(event: Event): Project | undefined {
  if (event.intent !== "global.createProject") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { project, permissions } = event.data;
      const values = { ...deepcopy(project), permissions: deepcopy(permissions), log: [] };
      return values as Project;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyUpdate(event: Event, project: Project): true | undefined {
  if (event.intent !== "project.update") return;
  switch (event.dataVersion) {
    case 1: {
      inheritDefinedProperties(project, event.data);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyAssign(event: Event, project: Project): true | undefined {
  if (event.intent !== "project.assign") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity } = event.data;
      project.assignee = identity;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyClose(event: Event, project: Project): true | undefined {
  if (event.intent !== "project.close") return;
  switch (event.dataVersion) {
    case 1: {
      project.status = "closed";
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyGrantPermission(event: Event, project: Project): true | undefined {
  if (event.intent !== "project.intent.grantPermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      const permissionsForIntent: People = project.permissions[intent] || [];
      if (!permissionsForIntent.includes(identity)) {
        permissionsForIntent.push(identity);
      }
      project.permissions[intent] = permissionsForIntent;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyRevokePermission(event: Event, project: Project): true | undefined {
  if (event.intent !== "project.intent.revokePermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      const permissionsForIntent: People = project.permissions[intent] || [];
      const userIndex = permissionsForIntent.indexOf(identity);
      if (userIndex !== -1) {
        // Remove the user from the array:
        permissionsForIntent.splice(userIndex, 1);
        project.permissions[intent] = permissionsForIntent;
      }
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

export async function issueNotification(
  conn: ConnToken,
  issuer: Issuer,
  message: Event,
  recipient: string,
): Promise<void> {
  // const notificationId = uuid();
  // // TODO message.key is working for projects
  // // TODO but we need to access projectId subprojectid and workflowitemid and build data.resources
  // const projectId = message.key;
  // const resources: NotificationResourceDescription[] = [
  //   {
  //     id: projectId,
  //     type: notificationTypeFromIntent(message.intent),
  //   },
  // ];
  // const intent = "notification.create";
  // const event: Event = {
  //   key: recipient,
  //   intent,
  //   createdBy: issuer.name,
  //   createdAt: new Date().toISOString(),
  //   dataVersion: 1,
  //   data: {
  //     notificationId,
  //     resources,
  //     isRead: false,
  //     originalEvent: message,
  //   },
  // };
  // const streamName = "notifications";
  // const publishEvent = () => {
  //   logger.debug(`Publishing ${intent} to ${streamName}/${recipient}`);
  //   return conn.multichainClient.getRpcClient().invoke("publish", streamName, recipient, {
  //     json: event,
  //   });
  // };
  // return publishEvent().catch(err => {
  //   if (err.code === -708) {
  //     logger.debug(
  //       `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
  //     );
  //     // The stream does not exist yet. Create the stream and try again:
  //     return conn.multichainClient
  //       .getOrCreateStream({ kind: "notifications", name: streamName })
  //       .then(() => publishEvent());
  //   } else {
  //     logger.error({ error: err }, `Publishing ${intent} failed.`);
  //     throw err;
  //   }
  // });
}

function notificationTypeFromIntent(intent: Intent): ResourceType {
  if (intent.startsWith("project.") || intent === "global.createProject") {
    return "project";
  } else if (intent.startsWith("subproject.") || intent === "project.createSubproject") {
    return "subproject";
  } else if (intent.startsWith("workflowitem.") || intent === "subproject.createWorkflowitem") {
    return "workflowitem";
  } else {
    throw Error(`Unknown ResourceType for intent ${intent}`);
  }
}
