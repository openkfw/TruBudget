import { isArray } from "util";

import { ResourceType } from "../lib/resourceTypes";
import { NotificationResourceDescription } from "../notification/model/Notification";
import * as NotificationCreated from "./domain/workflow/notification_created";
import * as SubprojectClosed from "./domain/workflow/subproject_closed";
import * as SubprojectCreated from "./domain/workflow/subproject_created";
import * as WorkflowitemsReordered from "./domain/workflow/subproject_items_reordered";
import * as SubprojectPermissionGranted from "./domain/workflow/subproject_permission_granted";
import * as SubprojectPermissionRevoked from "./domain/workflow/subproject_permission_revoked";
import * as SubprojectUpdated from "./domain/workflow/subproject_updated";
import * as WorkflowitemClosed from "./domain/workflow/workflowitem_closed";
import * as WorkflowitemPermissionGranted from "./domain/workflow/workflowitem_permission_granted";
import * as WorkflowitemPermissionRevoked from "./domain/workflow/workflowitem_permission_revoked";
import * as WorkflowitemUpdated from "./domain/workflow/workflowitem_updated";
import { Event } from "./event";

// TODO: at the end implement notification
/**
 * What will not work anymout:
 *  Subproject.Update will not update amount
 *  Subporject.Create Projecected Budgets need to be respected
 *  Rename all files permissions -> permission
 */

function isOldEvent(event) {
  const {
    key, // the resource ID (same for all events that relate to the same resource)
    intent,
    createdBy,
    createdAt,
    dataVersion, // integer
    data,
  } = event;

  return (
    key !== undefined &&
    intent !== undefined &&
    createdBy !== undefined &&
    createdAt !== undefined &&
    dataVersion !== undefined &&
    data !== undefined
  );
}

function mapOldEventToBusinessEvent(
  event,
  projectId?: string,
  subprojectId?: string,
  workflowitemId?: string,
) {
  const stream = projectId;

  let key: string[];
  if (projectId === undefined) {
    // No idea what this is..
    throw Error(
      `cannot map old event to business event (projectId is undefined): ${JSON.stringify(event)}`,
    );
  } else if (subprojectId === undefined) {
    // This is a project event:
    key = ["self"];
  } else if (workflowitemId === undefined) {
    // This is a subproject event:
    key = ["subprojects", subprojectId];
  } else {
    // This is a workflowitem event:
    key = [`${subprojectId}_workflows`, workflowitemId];
  }

  const data: Event = event;

  const params = [stream, key, data];
  const [a, b, request] = matchPublishRequest(params, stream, key, data);

  // TODO: will not work until all events are translated or new
  return request.json;
}

function makeOldNotificationResources(projectId, subprojectId, workflowitemId) {
  const resources: any[] = [];

  if (projectId) {
    resources.push({
      id: projectId,
      type: "project",
    });
  }
  if (subprojectId) {
    resources.push({
      id: subprojectId,
      type: "subproject",
    });
  }
  if (workflowitemId) {
    resources.push({
      id: workflowitemId,
      type: "workflowitem",
    });
  }

  return resources;
}

function mapBusinessEventToOldEvent(event) {
  return event;
}

function extractSubprojectFromKey(key) {
  const captured = /([^_]+)_workflows/.exec(key);

  if (!captured || captured.length !== 2) {
    return undefined;
  }

  return captured[1];
}

function handlePublishRequest(params: any[]): any[] {
  const [stream, key, data] = params;

  // only handle data in the correct format
  if (!data.json) {
    return params;
  }

  // only handle old event format
  if (!isOldEvent(data.json)) {
    return params;
  }

  const event: Event = data.json;

  return matchPublishRequest(params, stream, key, event);
}

function getResourceId(
  resources: NotificationResourceDescription[],
  resourceType: ResourceType,
): string | undefined {
  return resources
    .filter(x => x.type === resourceType)
    .map(x => x.id)
    .find(_ => true);
}

function matchPublishRequest(params: any[], stream, key, event: Event): any[] {
  let projectId: string | undefined;
  let subprojectId: string | undefined;
  let workflowitemId: string | undefined;
  if (event.intent === "subproject.reorderWorkflowitems") {
    projectId = stream;
    subprojectId = /^(.*)_workflowitem_ordering$/.exec(isArray(key) ? key[0] : key)![1];
  } else if (
    event.intent.startsWith("workflowitem.") ||
    event.intent === "subproject.createWorkflowitem"
  ) {
    if (key.length !== 2 || !key[0].endsWith("_workflows")) {
      throw Error(`bug: "${event.intent}" but keys=${JSON.stringify(key)}`);
    }
    projectId = stream;
    subprojectId = extractSubprojectFromKey(key[0]);
    workflowitemId = key[1];
  } else if (
    event.intent.startsWith("subproject.") ||
    event.intent === "project.createSubproject"
  ) {
    if (key.length !== 2 || key[0] !== "subprojects") {
      throw Error(`bug: "${event.intent}" but keys=${JSON.stringify(key)}`);
    }
    projectId = stream;
    subprojectId = key[1];
  } else if (event.intent.startsWith("project.")) {
    projectId = stream;
  }

  switch (event.intent) {
    case "notification.create": {
      if (!event.intent) {
        // This already a BusinessEvent - no need to convert anything.
        return params;
      }

      if (!event.data || !event.data.resources) {
        console.error("Error handling publish request for notification.create", params);
        return params;
      }
      const resourceDescriptions = event.data.resources as NotificationResourceDescription[];
      projectId = getResourceId(resourceDescriptions, "project");
      subprojectId = getResourceId(resourceDescriptions, "subproject");
      workflowitemId = getResourceId(resourceDescriptions, "workflowitem");
      const notificationCreated: NotificationCreated.Event = NotificationCreated.createEvent(
        "http", // source
        event.createdBy, // publisher
        event.key, // recipient
        mapOldEventToBusinessEvent(
          event.data.originalEvent,
          projectId,
          subprojectId,
          workflowitemId,
        ),
        projectId,
        subprojectId,
        workflowitemId,
      );
      return [stream, key, { json: notificationCreated }];
    }
    case "notification.markRead":
      return params;
    case "global.createProject":
      return params;
    case "project.intent.grantPermission":
      return params;
    case "project.intent.revokePermission":
      return params;
    case "project.assign":
      return params;
    case "project.update":
      return params;
    case "project.close":
      return params;
    case "project.createSubproject": {
      if (!event.data.subproject) {
        console.error(
          "Error handling publish request for project.createSubproject",
          JSON.stringify(params),
        );
        return params;
      }
      const spCreated: SubprojectCreated.Event = SubprojectCreated.createEvent(
        "http",
        event.createdBy,
        projectId!,
        {
          id: event.data.subproject.id,
          status: event.data.subproject.status,
          displayName: event.data.subproject.displayName,
          description: event.data.subproject.description,
          assignee: event.data.subproject.assignee,
          currency: event.data.subproject.currency,
          projectedBudgets: event.data.subproject.projectedBudgets || [],
          permissions: event.data.permissions,
          additionalData: event.data.subproject.additionalData,
        },
      );
      return [stream, key, { json: spCreated }];
    }
    case "subproject.update": {
      if (!event.data) {
        console.error("Error handling publish request for subproject.update", params);
        return params;
      }
      const spUpdated: SubprojectUpdated.Event = SubprojectUpdated.createEvent(
        "http",
        event.createdBy,
        projectId!,
        subprojectId!,
        {
          displayName: event.data.displayName,
          description: event.data.description,
          additionalData: event.data.additionalData,
        },
      );
      return [stream, key, { json: spUpdated }];
    }
    case "subproject.close": {
      if (!event.data) {
        console.error("Error handling publish request for subproject.close", params);
        return params;
      }

      const spClosed: SubprojectClosed.Event = SubprojectClosed.createEvent(
        "http",
        event.createdBy,
        projectId!,
        subprojectId!,
      );
      return [stream, key, { json: spClosed }];
    }
    case "subproject.intent.grantPermission": {
      if (!event.data) {
        console.error(
          "Error handling publish request for subproject.intent.grantPermission",
          params,
        );
        return params;
      }

      const spGranted: SubprojectPermissionGranted.Event = SubprojectPermissionGranted.createEvent(
        "http",
        event.createdBy,
        projectId!,
        subprojectId!,
        event.data.intent,
        event.data.identity,
      );
      return [stream, key, { json: spGranted }];
    }
    case "subproject.intent.revokePermission": {
      if (!event.data) {
        console.error(
          "Error handling publish request for subproject.intent.revokePermission",
          params,
        );
        return params;
      }

      const spRevoked: SubprojectPermissionRevoked.Event = SubprojectPermissionRevoked.createEvent(
        "http",
        event.createdBy,
        projectId!,
        subprojectId!,
        event.data.intent,
        event.data.identity,
      );
      return [stream, key, { json: spRevoked }];
    }
    case "subproject.reorderWorkflowitems": {
      if (!event.data) {
        console.error("Error handling publish request for subproject.reorderWorkflowitems", params);
        return params;
      }
      const wfReordered: WorkflowitemsReordered.Event = WorkflowitemsReordered.createEvent(
        "http",
        event.createdBy,
        projectId!,
        subprojectId!,
        event.data ? event.data : [],
      );
      return [stream, key, { json: wfReordered }];
    }
    case "workflowitem.update": {
      if (!event.data) {
        console.error(
          "Error handling publish request for workflowitem.update",
          JSON.stringify(params, null, 2),
        );
        return params;
      }

      const wfiUpdated: WorkflowitemUpdated.Event = WorkflowitemUpdated.createEvent(
        "http",
        event.createdBy,
        projectId!,
        subprojectId!,
        workflowitemId!,
        {
          displayName: event.data.displayName,
          description: event.data.description,
          amountType: event.data.amountType,
          documents: event.data.documents,
          amount: event.data.amount,
          currency: event.data.currency,
          exchangeRate: event.data.exchangeRate,
          billingDate: event.data.billingDate,
          dueDate: event.data.dueDate,
          additionalData: event.data.additionalData,
        },
      );

      return [stream, key, { json: wfiUpdated }];
    }
    case "workflowitem.close": {
      if (!event.data) {
        console.error("Error handling publish request for workflowitem.close", params);
        return params;
      }

      const wfiClosed: WorkflowitemClosed.Event = WorkflowitemClosed.createEvent(
        "http",
        event.createdBy,
        projectId!,
        subprojectId!,
        workflowitemId!,
      );
      return [stream, key, { json: wfiClosed }];
    }
    case "workflowitem.intent.grantPermission": {
      if (!event.data) {
        console.error("Error handling publish request for workflowitem.close", params);
        return params;
      }

      const wfiGranted: WorkflowitemPermissionGranted.Event = WorkflowitemPermissionGranted.createEvent(
        "http",
        event.createdBy,
        projectId!,
        subprojectId!,
        workflowitemId!,
        event.data.intent,
        event.data.identity,
      );
      return [stream, key, { json: wfiGranted }];
    }
    case "workflowitem.intent.revokePermission": {
      if (!event.data) {
        console.error("Error handling publish request for workflowitem.close", params);
        return params;
      }

      const wfiGranted: WorkflowitemPermissionRevoked.Event = WorkflowitemPermissionRevoked.createEvent(
        "http",
        event.createdBy,
        projectId!,
        subprojectId!,
        workflowitemId!,
        event.data.intent,
        event.data.identity,
      );
      return [stream, key, { json: wfiGranted }];
    }
    default:
      return params;
  }
}

export function interceptRequest(method: string, oldParams: any[]): any[] {
  switch (method) {
    case "publish":
      return handlePublishRequest(oldParams);

    default:
      return oldParams;
  }
}

function handleListStreamKeyItemsResponse(method: string, params: any[], result: any): any {
  if (!(result.data && result.data.json)) {
    return result;
  }

  // only handle old event format
  if (isOldEvent(result.data.json)) {
    return result;
  }

  switch (result.data.json.type) {
    case "notification_created":
    // {
    //   const event: NotificationCreated.Event = result.data.json;

    //   const oldEvent: Event = {
    //     key: event.recipient,
    //     intent: "notification.create",
    //     createdBy: event.publisher,
    //     createdAt: event.time,
    //     dataVersion: 1,
    //     data: {
    //       notificationId: event.notificationId,
    //       resources: makeOldNotificationResources(
    //         event.projectId,
    //         event.subprojectId,
    //         event.workflowitemId,
    //       ),
    //       time: event.time,
    //       isRead: false,
    //       originalEvent: event.businessEvent,
    //     },
    //   };
    //   return { ...result, data: { json: oldEvent } };
    // }
    case "project_created":
    case "project_permission_granted":
    case "project_permission_revoked":
    case "project_assigned":
    case "project_updated":
    case "project_closed":
    case "subproject_created":
      return result;
    //   const event: SubprojectCreated.Event = result.data.json;
    //   const oldEvent: Event = {
    //     key: event.subproject.id,
    //     intent: "project.createSubproject",
    //     createdBy: event.publisher,
    //     createdAt: event.time,
    //     dataVersion: 1,
    //     data: {
    //       subproject: {
    //         id: event.subproject.id,
    //         creationUnixTs: new Date(event.time).getTime(),
    //         status: event.subproject.status,
    //         displayName: event.subproject.displayName,
    //         description: event.subproject.description,
    //         assignee: event.subproject.assignee,
    //         currency: event.subproject.currency,
    //         projectedBudgets: event.subproject.projectedBudgets,
    //         additionalData: event.subproject.additionalData,
    //       },
    //       permissions: event.subproject.permissions,
    //     },
    //   };
    //   return { ...result, data: { json: oldEvent } };
    // }
    case "subproject_updated": {
      const event: SubprojectUpdated.Event = result.data.json;
      const oldEvent: Event = {
        key: event.subprojectId,
        intent: "subproject.update",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          displayName: event.update.displayName,
          description: event.update.description,
          additionalData: event.update.additionalData,
        },
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "subproject_closed": {
      const event: SubprojectClosed.Event = result.data.json;
      const oldEvent: Event = {
        key: event.subprojectId,
        intent: "subproject.close",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {},
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "subproject_permission_granted": {
      const event: SubprojectPermissionGranted.Event = result.data.json;
      const oldEvent: Event = {
        key: event.subprojectId,
        intent: "subproject.intent.grantPermission",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          intent: event.permission,
          identity: event.grantee,
        },
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "subproject_permission_revoked": {
      const event: SubprojectPermissionRevoked.Event = result.data.json;
      const oldEvent: Event = {
        key: event.subprojectId,
        intent: "subproject.intent.revokePermission",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          intent: event.permission,
          identity: event.revokee,
        },
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "workflowitems_reordered": {
      const event: WorkflowitemsReordered.Event = result.data.json;
      const oldEvent: Event = {
        key: event.subprojectId,
        intent: "subproject.reorderWorkflowitems",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: event.ordering ? event.ordering : [],
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "workflowitem_updated": {
      const event: WorkflowitemUpdated.Event = result.data.json;
      const oldEvent: Event = {
        key: event.workflowitemId,
        intent: "workflowitem.update",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          displayName: event.update.displayName,
          exchangeRate: event.update.exchangeRate,
          billingDate: event.update.billingDate,
          amount: event.update.amount,
          currency: event.update.currency,
          amountType: event.update.amountType,
          description: event.update.description,
          documents: event.update.documents,
          additionalData: event.update.additionalData,
        },
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "workflowitem_closed": {
      const event: WorkflowitemClosed.Event = result.data.json;
      const oldEvent: Event = {
        key: event.workflowitemId,
        intent: "workflowitem.close",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {},
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "workflowitem_permission_granted": {
      const event: WorkflowitemPermissionGranted.Event = result.data.json;
      const oldEvent: Event = {
        key: event.workflowitemId,
        intent: "workflowitem.intent.grantPermission",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          intent: event.permission,
          identity: event.grantee,
        },
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "workflowitem_permission_revoked": {
      const event: WorkflowitemPermissionRevoked.Event = result.data.json;
      const oldEvent: Event = {
        key: event.workflowitemId,
        intent: "workflowitem.intent.revokePermission",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          intent: event.permission,
          identity: event.revokee,
        },
      };
      return { ...result, data: { json: oldEvent } };
    }
    default:
      return result;
  }
}

export function interceptResult(method: string, params: any[], oldResult: any): any {
  // only rewrite event-sourced requests
  switch (method) {
    case "liststreamkeyitems":
      if (!oldResult || !oldResult.length) {
        return oldResult;
      }
      return oldResult.map(r => handleListStreamKeyItemsResponse(method, params, r));

    case "liststreamitems":
      return oldResult.map(r => handleListStreamKeyItemsResponse(method, params, r));

    default:
      return oldResult;
  }
}
