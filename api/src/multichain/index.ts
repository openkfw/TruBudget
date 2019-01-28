import uuid = require("uuid");

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
  resources: NotificationResourceDescription[],
): Promise<void> {
  const notificationId = uuid();
  // TODO message.key is working for projects
  // TODO but we need to access projectId subprojectid and workflowitemid and build data.resources
  // const projectId = message.key;
  // const resources: NotificationResourceDescription[] = [
  //   {
  //     id: projectId,
  //     type: notificationTypeFromIntent(message.intent),
  //   },
  // ];
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

export function generateResources(
  projectId: string,
  subprojectId?: string,
  workflowitemId?: string,
): NotificationResourceDescription[] {
  const notificationResource: NotificationResourceDescription[] = [];
  if (!projectId) {
    throw { kind: "PreconditionError", message: "No project ID provided" };
  }
  notificationResource.unshift({
    id: projectId,
    type: "project",
  });
  if (subprojectId) {
    notificationResource.unshift({
      id: subprojectId,
      type: "subproject",
    });
  }
  if (workflowitemId) {
    notificationResource.unshift({
      id: workflowitemId,
      type: "workflowitem",
    });
  }

  return notificationResource;
}

export async function getWorkflowitemList(
  multichain: MultichainClient,
  projectId: string,
  subprojectId: string,
  user: MultichainWorkflowitem.User,
): Promise<MultichainWorkflowitem.Workflowitem[]> {
  const queryKey = workflowitemsGroupKey(subprojectId);

  const streamItems = await multichain.v2_readStreamItems(projectId, queryKey);
  const workflowitemsMap = new Map<string, MultichainWorkflowitem.Workflowitem>();
  const permissionsMap = new Map<string, AllowedUserGroupsByIntent>();

  for (const item of streamItems) {
    const event = item.data.json as Event;

    // Events look differently for different intents!
    let workflowitem = workflowitemsMap.get(asMapKey(item));

    if (workflowitem === undefined) {
      const result = MultichainWorkflowitem.handleCreate(event);

      if (result === undefined) {
        throw Error(`Failed to initialize resource: ${JSON.stringify(event)}.`);
      }
      workflowitem = result;
      workflowitem.log = [];
      permissionsMap.set(asMapKey(item), workflowitem.permissions);
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
  }

  const unfilteredResources = [...workflowitemsMap.values()];
  return unfilteredResources;
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

export function closeWorkflowitem(
  multichain: MultichainClient,
  issuer: Issuer,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<void> {
  const intent: Intent = "workflowitem.close";

  const event = {
    key: workflowitemId,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    data: {},
  };

  const streamName = projectId;
  const streamItemKey = workflowitemsGroupKey(subprojectId);
  const streamItem = { json: event };

  logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
  return multichain
    .getRpcClient()
    .invoke("publish", streamName, streamItemKey, streamItem)
    .then(() => event);
}

/*
Event on chain:
{
        "publishers" : [
            "1DUPFSzYNwPkyunNsWiRNHtJXGDRgpMwtwgZKA"
        ],
        "keys" : [
            "38c119026592c19ad80ecbd42272e212_workflows",
            "b08bfd9df7dcc42cc781ca36b583ad7a"
        ],
        "offchain" : false,
        "available" : true,
        "data" : {
            "json" : {
                "key" : "b08bfd9df7dcc42cc781ca36b583ad7a",
                "intent" : "workflowitem.close",
                "createdBy" : "mstein",
                "createdAt" : "2019-01-25T08:45:00.201Z",
                "dataVersion" : 1,
                "data" : {
                }
            }
        },
        "confirmations" : 1,
        "blocktime" : 1548405901,
        "txid" : "4176136e077daaf25c9bbb819394fd7c3de406d543e87467fcdb97e9272da169"
    },
*/
// export async function closeWorkflowitem(multichain: MultichainClient, req): Promise<HttpResponse> {
//   const input = value("data", req.body.data, x => x !== undefined);

//   const projectId: string = value("projectId", input.projectId, isNonemptyString);
//   const subprojectId: string = value("subprojectId", input.subprojectId, isNonemptyString);
//   const workflowitemId: string = value("workflowitemId", input.workflowitemId, isNonemptyString);

//   const userIntent: Intent = "workflowitem.close";

//   // Is the user allowed to close a workflowitem?
//   await throwIfUnauthorized(
//     req.user,
//     userIntent,
//     await Workflowitem.getPermissions(multichain, projectId, workflowitemId),
//   );

//   // We need to make sure that all previous (wrt. ordering) workflowitems are already closed:
//   const sortedItems = await ensureAllPreviousWorkflowitemsAreClosed(
//     multichain,
//     req.user,
//     projectId,
//     subprojectId,
//     workflowitemId,
//   );

//   const publishedEvent = await sendEventToDatabase(
//     multichain,
//     req.user,
//     userIntent,
//     projectId,
//     subprojectId,
//     workflowitemId,
//   );

//   const resourceDescriptions: Notification.NotificationResourceDescription[] = [
//     { id: workflowitemId, type: "workflowitem" },
//     { id: subprojectId, type: "subproject" },
//     { id: projectId, type: "project" },
//   ];
//   const createdBy = req.user.userId;

//   // If the workflowitem is assigned to someone else, that person is notified about the
//   // change:
//   const workflowitemAssignee = await notifyAssignee(
//     multichain,
//     resourceDescriptions,
//     createdBy,
//     await Workflowitem.get(
//       multichain,
//       req.user,
//       projectId,
//       subprojectId,
//       workflowitemId,
//       "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!",
//     ),
//     publishedEvent,
//     [req.user.userId], // skipNotificationsFor
//   );

//   // If the parent subproject is (1) not assigned to the token user and (2) not assigned
//   // to the same guy the workflowitem is assigned to, that person is notified about the
//   // change too.
//   const skipNotificationsFor = [req.user.userId].concat(
//     workflowitemAssignee ? [workflowitemAssignee] : [],
//   );
//   await notifyAssignee(
//     multichain,
//     resourceDescriptions,
//     createdBy,
//     await Subproject.get(
//       multichain,
//       req.user,
//       projectId,
//       subprojectId,
//       "skip authorization check FOR INTERNAL USE ONLY TAKE CARE DON'T LEAK DATA !!!",
//     ),
//     publishedEvent,
//     skipNotificationsFor,
//   );

//   return [200, { apiVersion: "1.0", data: "OK" }];
// }
