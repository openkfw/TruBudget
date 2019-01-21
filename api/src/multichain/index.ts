import uuid = require("uuid");

import { getAllowedIntents } from "../authz";
import Intent from "../authz/intents";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import deepcopy from "../lib/deepcopy";
import { isNotEmpty } from "../lib/emptyChecks";
import { inheritDefinedProperties } from "../lib/inheritDefinedProperties";
import logger from "../lib/logger";
import { User } from "../workflowitem/User";
import { asMapKey } from "./Client";
import { MultichainClient } from "./Client.h";
import { Event, throwUnsupportedEventVersion } from "./event";
import * as Liststreamkeyitems from "./responses/liststreamkeyitems";
import * as MultichainWorkflowitem from "./Workflowitem";
import { redactWorkflowitemData } from "../workflowitem";
import { getUserAndGroups } from "../authz/index";

export * from "./event";
export * from "./Workflowitem";

const projectSelfKey = "self";
const workflowitemsGroupKey = subprojectId => `${subprojectId}_workflows`;
const workflowitemOrderingKey = subprojectId => `${subprojectId}_workflowitem_ordering`;

export interface Issuer {
  name: string;
  address: string;
}

export interface Project {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  assignee?: string;
  description: string;
  amount: string;
  currency: string;
  thumbnail: string;
  permissions: AllowedUserGroupsByIntent;
  log: HistoryEvent[];
}

interface HistoryEvent {
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

type ResourceType = "project" | "subproject" | "workflowitem";

interface NotificationResourceDescription {
  id: string;
  type: ResourceType;
}

function grantProjectPermission(project: Project, identity: string, intent: Intent) {
  const permissionsForIntent: People = project.permissions[intent] || [];
  if (!permissionsForIntent.includes(identity)) {
    permissionsForIntent.push(identity);
  }
  project.permissions[intent] = permissionsForIntent;
}

function revokeProjectPermission(project: Project, identity: string, intent: Intent) {
  const permissionsForIntent: People = project.permissions[intent] || [];
  const userIndex = permissionsForIntent.indexOf(identity);
  if (userIndex !== -1) {
    // Remove the user from the array:
    permissionsForIntent.splice(userIndex, 1);
    project.permissions[intent] = permissionsForIntent;
  }
}

export async function writeProjectAssignedToChain(
  multichain: MultichainClient,
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
  return multichain
    .getRpcClient()
    .invoke("publish", streamName, streamItemKey, streamItem)
    .then(() => event);
}

export interface ProjectUpdate {
  displayName?: string;
  description?: string;
  amount?: string;
  currency?: string;
  thumbnail?: string;
}

export async function updateProject(
  multichain: MultichainClient,
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
  return multichain
    .getRpcClient()
    .invoke("publish", streamName, streamItemKey, streamItem)
    .then(() => event);
}

export async function getProject(multichain: MultichainClient, id: string): Promise<Project> {
  const streamItems = await fetchStreamItems(multichain, id);
  let project: Project | undefined;

  for (const item of streamItems) {
    const event = item.data.json as Event;
    if (project === undefined) {
      project = handleCreate(event);
      if (project === undefined) {
        throw Error(`Failed to read project: ${JSON.stringify(event)}.`);
      }
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
    project.log.push({
      ...event,
      snapshot: { displayName: deepcopy(project.displayName) },
    });
  }

  if (project === undefined) {
    throw Error(`Failed to source project ${id}`);
  }

  return project;
}

export async function getProjectList(multichain: MultichainClient): Promise<Project[]> {
  const streamItems = await fetchStreamItems(multichain);
  const projectsMap = new Map<string, Project>();

  for (const item of streamItems) {
    const event = item.data.json as Event;
    let project = projectsMap.get(asMapKey(item));
    if (project === undefined) {
      project = handleCreate(event);
      if (project === undefined) {
        throw Error(`Failed to read project: ${JSON.stringify(event)}.`);
      }
    } else {
      // We've already encountered this project, so we can apply operations on it.
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
    projectsMap.set(asMapKey(item), project);
  }

  return [...projectsMap.values()];
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
      grantProjectPermission(project, identity, intent);
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
      revokeProjectPermission(project, identity, intent);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

export async function issueNotification(
  multichain: MultichainClient,
  issuer: Issuer,
  message: Event,
  recipient: string,
): Promise<void> {
  const notificationId = uuid();
  // TODO message.key is working for projects
  // TODO but we need to access projectId subprojectid and workflowitemid and build data.resources
  const projectId = message.key;
  const resources: NotificationResourceDescription[] = [
    {
      id: projectId,
      type: notificationTypeFromIntent(message.intent),
    },
  ];
  const intent = "notification.create";
  const event: Event = {
    key: recipient,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: {
      notificationId,
      resources,
      isRead: false,
      originalEvent: message,
    },
  };

  const streamName = "notifications";

  const publishEvent = () => {
    logger.debug(`Publishing ${intent} to ${streamName}/${recipient}`);
    return multichain.getRpcClient().invoke("publish", streamName, recipient, {
      json: event,
    });
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      logger.debug(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "notifications", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: err }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
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

export async function getWorkflowitemList(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  user: MultichainWorkflowitem.User,
): Promise<MultichainWorkflowitem.Workflowitem[]> {
  console.log("In getWorkflowitemList / multichain");
  const queryKey = workflowitemsGroupKey(subprojectId);
  console.log(queryKey);

  const streamItems = await multichain.v2_readStreamItems(projectId, queryKey);
  console.log(streamItems);
  // const userAndGroups = await getUserAndGroups(token);
  const workflowitemsMap = new Map<string, MultichainWorkflowitem.Workflowitem>();
  const permissionsMap = new Map<string, AllowedUserGroupsByIntent>();

  for (const item of streamItems) {
    const event = item.data.json as Event;

    // Events look differently for different intents!
    let workflowitem = workflowitemsMap.get(asMapKey(item));
    console.log("Resource: ");
    console.log(workflowitem);

    if (workflowitem === undefined) {
      const result = MultichainWorkflowitem.handleCreate(event);
      if (result === undefined) {
        throw Error(`Failed to initialize resource: ${JSON.stringify(event)}.`);
      }
      workflowitem = result;
      permissionsMap.set(asMapKey(item), result.permissions);
    } else {
      // We've already encountered this workflowitem, so we can apply operations on it.
      const permissions = permissionsMap.get(asMapKey(item))!;
      const hasProcessedEvent =
        MultichainWorkflowitem.applyUpdate(event, workflowitem) ||
        MultichainWorkflowitem.applyAssign(event, workflowitem) ||
        MultichainWorkflowitem.applyClose(event, workflowitem) ||
        MultichainWorkflowitem.applyGrantPermission(event, permissions) ||
        MultichainWorkflowitem.applyRevokePermission(event, permissions);
      if (!hasProcessedEvent) {
        const message = "Unexpected event occured";
        throw Error(`${message}: ${JSON.stringify(event)}.`);
      }
    }

    if (workflowitem !== undefined) {
      // Save all events to the log for now; we'll filter them once we
      // know the final workflowitem permissions.
      workflowitem.log.push({
        ...event,
        snapshot: {
          displayName: deepcopy(workflowitem.displayName),
          amount: deepcopy(workflowitem.amount),
          currency: deepcopy(workflowitem.currency),
          amountType: deepcopy(workflowitem.amountType),
        },
      });
      workflowitemsMap.set(asMapKey(item), workflowitem);
    }
    if (workflowitem !== undefined) {
      // Save all events to the log for now; we'll filter them once we
      // know the final resource permissions.
      workflowitemsMap.set(asMapKey(item), workflowitem);
    }
  }

  for (const [key, permissions] of permissionsMap.entries()) {
    const resource = workflowitemsMap.get(key);
    if (resource !== undefined) {
      resource.permissions = await getAllowedIntents(
        MultichainWorkflowitem.userIdentities(user),
        permissions,
      );
    }
  }

  const unfilteredResources = [...workflowitemsMap.values()];

  return unfilteredResources;

  // Instead of filtering out workflowitems the user is not allowed to see,
  // we simply blank out all fields except the status, which is considered "public".
  // const allowedToSeeDataIntent: Intent = "workflowitem.view";
  // const filteredResources = unfilteredResources.map(resource => {
  // Redact data if the user is not allowed to view it:
  // Redaction of data is part of the business logic and should be done there!
  // const isAllowedToSeeData = Object.values(resource.permissions).includes(allowedToSeeDataIntent);
  // if (!isAllowedToSeeData) resource = redactWorkflowitemData(resource) as any;

  // Filter event log according to the user permissions and the type of event:
  // Filtering of event log is part of busoness logic
  // resource.log = resource.log
  //   .map(event => onlyAllowedData(event, resource.allowedIntents) as AugmentedEvent | null)
  //   .filter(isNotEmpty);

  // return resource;
  // });

  // return filteredResources;
}

export async function fetchWorkflowitemOrdering(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
): Promise<string[]> {
  // Currently, the workflowitem ordering is stored in full; therefore, we only
  // need to retrieve the latest item(see`publishWorkflowitemOrdering`).
  const expectedDataVersion = 1;
  const nValues = 1;

  const streamItems = await multichain
    .v2_readStreamItems(projectId, workflowitemOrderingKey(subprojectId), nValues)
    .then(items => {
      if (items.length > 0) return items;
      else throw { kind: "NotFound", what: workflowitemOrderingKey(subprojectId) };
    })
    .catch(err => {
      if (err.kind === "NotFound") {
        return [{ data: { json: { dataVersion: 1, data: [] } } }];
      } else {
        throw err;
      }
    });

  const item = streamItems[0];
  const event = item.data.json as Event;
  if (event.dataVersion !== expectedDataVersion) {
    throwUnsupportedEventVersion(event);
  }

  const ordering: string[] = event.data;
  return ordering;
}
