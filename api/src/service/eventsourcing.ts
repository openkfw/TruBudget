import Intent from "../authz/intents";
import { People, Permissions } from "../authz/types";
import deepcopy from "../lib/deepcopy";
import { inheritDefinedProperties } from "../lib/inheritDefinedProperties";
import logger from "../lib/logger";
import { Event, throwUnsupportedEventVersion } from "./event";
import { Item } from "./liststreamkeyitems";
import * as Workflowitem from "./Workflowitem";

export interface Subproject {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee?: string;
  currency: string;
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  log: HistoryEvent[];
  workflowitems: Map<string, Workflowitem.Workflowitem>;
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
  subprojects: Map<string, Subproject>;
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

const isProjectEvent = (item: Item) => item.keys.length === 1 && item.keys[0] === "self";
const isSubprojectEvent = (item: Item) => item.keys.length === 2 && item.keys[0] === "subprojects";
const isWorkflowitemEvent = (item: Item) =>
  item.keys.length === 2 && item.keys[0].endsWith("_workflows");

function applyProjectEvent(project: Project, item: Item): void {
  const event = item.data.json as Event;
  const hasProcessedEvent =
    projectUpdated(event, project) ||
    assignedToProject(event, project) ||
    projectClosed(event, project) ||
    projectPermissionGranted(event, project) ||
    projectPermissionRevoked(event, project);
  if (!hasProcessedEvent) {
    logger.error(event, `Event ignored for key ${event.key}`);
  }
}

function applySubprojectEvent(project: Project, item: Item): void {
  const event = item.data.json as Event;
  let subproject = project.subprojects.get(event.key);
  if (subproject === undefined) {
    subproject = subprojectCreated(event);
    if (subproject !== undefined) {
      project.subprojects.set(event.key, subproject);
    } else {
      logger.error(event, `Subproject event ignored for project ${project.id}`);
    }
  } else {
    const hasProcessedEvent =
      subprojectUpdated(event, subproject) ||
      assignedToSubproject(event, subproject) ||
      subprojectClosed(event, subproject) ||
      subprojectPermissionGranted(event, subproject) ||
      subprojectPermissionRevoked(event, subproject);
    if (!hasProcessedEvent) {
      logger.error(event, `Subproject event ignored for project ${project.id}`);
    }
  }

  if (subproject !== undefined && isSubprojectEvent(item)) {
    subproject.log.push({
      ...event,
      snapshot: { displayName: deepcopy(subproject.displayName) },
    });
  }
}

function applyWorkflowitemEvent(project: Project, subprojectId: string, item: Item): void {
  const event = item.data.json as Event;
  const subproject = project.subprojects.get(subprojectId);
  if (subproject === undefined) {
    logger.error(event, `Workflowitem event ignored for unknown subproject ${subprojectId}`);
    return;
  }
  let workflowitem = subproject.workflowitems.get(event.key);
  if (workflowitem === undefined) {
    workflowitem = Workflowitem.handleCreate(event);
    if (workflowitem !== undefined) {
      subproject.workflowitems.set(event.key, workflowitem);
    } else {
      logger.error(
        event,
        `Workflowitem event ignored for subproject ${subproject.id} of project ${project.id}`,
      );
    }
  } else {
    const hasProcessedEvent =
      Workflowitem.applyUpdate(event, workflowitem) ||
      Workflowitem.applyAssign(event, workflowitem) ||
      Workflowitem.applyClose(event, workflowitem) ||
      Workflowitem.applyGrantPermission(event, workflowitem) ||
      Workflowitem.applyRevokePermission(event, workflowitem);
    if (!hasProcessedEvent) {
      logger.error(
        event,
        `Workflowitem event ignored for subproject ${subproject.id} of project ${project.id}`,
      );
    }
  }

  if (workflowitem !== undefined && isWorkflowitemEvent(item)) {
    workflowitem.log.push({
      ...event,
      snapshot: {
        displayName: deepcopy(workflowitem.displayName),
        amount: deepcopy(workflowitem.amount)!,
        currency: deepcopy(workflowitem.currency)!,
        amountType: deepcopy(workflowitem.amountType),
      },
    });
  }
}

export function applyStreamItems(streamItems: Item[], project?: Project): Project | undefined {
  if (logger.levelVal >= logger.levels.values.trace) {
    const action = project ? "Applying" : "Sourcing";
    const target = project ? ` to project ${project.id}` : "";
    logger.trace(`${action} ${streamItems.length} stream items${target}`);
  }
  for (const item of streamItems) {
    const event = item.data.json as Event;

    if (event.intent === undefined) {
      logger.debug({ event }, `cache1: ignoring event`);
      continue;
    }

    if (project === undefined) {
      project = projectCreated(event);
    } else {
      if (isProjectEvent(item)) {
        applyProjectEvent(project, item);
      } else if (isSubprojectEvent(item)) {
        applySubprojectEvent(project, item);
      } else if (isWorkflowitemEvent(item)) {
        const subprojectId = /^(.*)_workflows$/.exec(item.keys[0])![1];
        applyWorkflowitemEvent(project, subprojectId, item);
      } else {
        logger.error(event, `Event ignored for key ${JSON.stringify(item.keys)}`);
      }
    }

    if (project !== undefined && isProjectEvent(item)) {
      project.log.push({
        ...event,
        snapshot: { displayName: deepcopy(project.displayName) },
      });
    }

    logger.trace({ project, item }, `Applied stream item to project`);
  }
  return project;
}

function projectCreated(event: Event): Project | undefined {
  if (event.intent !== "global.createProject") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { project, permissions } = event.data;
      const values = {
        ...deepcopy(project),
        permissions: deepcopy(permissions),
        log: [],
        subprojects: new Map(),
      };
      return values as Project;
    }
  }
  throwUnsupportedEventVersion(event);
}

function projectUpdated(event: Event, project: Project): true | undefined {
  if (event.intent !== "project.update") return;
  switch (event.dataVersion) {
    case 1: {
      inheritDefinedProperties(project, event.data);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function assignedToProject(event: Event, project: Project): true | undefined {
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

function projectClosed(event: Event, project: Project): true | undefined {
  if (event.intent !== "project.close") return;
  switch (event.dataVersion) {
    case 1: {
      project.status = "closed";
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function projectPermissionGranted(event: Event, project: Project): true | undefined {
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

function grantProjectPermission(project: Project, identity: string, intent: Intent) {
  const permissionsForIntent: People = project.permissions[intent] || [];
  if (!permissionsForIntent.includes(identity)) {
    permissionsForIntent.push(identity);
  }
  project.permissions[intent] = permissionsForIntent;
}

function projectPermissionRevoked(event: Event, project: Project): true | undefined {
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

function revokeProjectPermission(project: Project, identity: string, intent: Intent) {
  const permissionsForIntent: People = project.permissions[intent] || [];
  const userIndex = permissionsForIntent.indexOf(identity);
  if (userIndex !== -1) {
    // Remove the user from the array:
    permissionsForIntent.splice(userIndex, 1);
    project.permissions[intent] = permissionsForIntent;
  }
}

function subprojectCreated(event: Event): Subproject | undefined {
  if (event.intent !== "project.createSubproject") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { subproject, permissions } = event.data;
      return {
        ...deepcopy(subproject),
        permissions: deepcopy(permissions),
        log: [],
        workflowitems: new Map(),
      };
    }
  }
  throwUnsupportedEventVersion(event);
}

function subprojectUpdated(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.update") return;
  switch (event.dataVersion) {
    case 1: {
      inheritDefinedProperties(subproject, event.data);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function assignedToSubproject(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.assign") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity } = event.data;
      subproject.assignee = identity;
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function subprojectClosed(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.close") return;
  switch (event.dataVersion) {
    case 1: {
      subproject.status = "closed";
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function subprojectPermissionGranted(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.intent.grantPermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      grantSubprojectPermission(subproject, identity, intent);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function subprojectPermissionRevoked(event: Event, subproject: Subproject): true | undefined {
  if (event.intent !== "subproject.intent.revokePermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      revokeSubprojectPermission(subproject, identity, intent);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function grantSubprojectPermission(subproject: Subproject, identity: string, intent: Intent) {
  const permissionsForIntent: People = subproject.permissions[intent] || [];
  if (!permissionsForIntent.includes(identity)) {
    permissionsForIntent.push(identity);
  }
  subproject.permissions[intent] = permissionsForIntent;
}

function revokeSubprojectPermission(subproject: Subproject, identity: string, intent: Intent) {
  const permissionsForIntent: People = subproject.permissions[intent] || [];
  const userIndex = permissionsForIntent.indexOf(identity);
  if (userIndex !== -1) {
    // Remove the user from the array:
    permissionsForIntent.splice(userIndex, 1);
    subproject.permissions[intent] = permissionsForIntent;
  }
}
