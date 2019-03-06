import { Event } from "./event";

import * as NotificationCreated from "../service/domain/workflow/notification_created";
import * as NotificationRead from "../service/domain/workflow/notification_read";
import * as ProjectAssigned from "../service/domain/workflow/project_assigned";
import * as ProjectCreated from "../service/domain/workflow/project_created";
import * as ProjectUpdated from "../service/domain/workflow/project_updated";
import * as ProjectClosed from "../service/domain/workflow/project_closed";
// TODO: rename file (plural to singular -> permissions to permission)
import * as ProjectPermissionGranted from "../service/domain/workflow/project_permissions_granted";
import * as ProjectPermissionRevoked from "../service/domain/workflow/project_permissions_revoked";
import * as SubprojectAssigned from "../service/domain/workflow/subproject_assigned";
import * as SubprojectCreated from "../service/domain/workflow/subproject_created";
import * as SubprojectUpdated from "../service/domain/workflow/subproject_updated";
import * as SubprojectClosed from "../service/domain/workflow/subproject_closed";
// TODO: rename file (plural to singular -> permissions to permission)
import * as SubprojectPermissionGranted from "../service/domain/workflow/subproject_permissions_granted";
import * as SubprojectPermissionRevoked from "../service/domain/workflow/subproject_permissions_revoked";
import * as WorkflowitemsReordered from "../service/domain/workflow/workflowitems_reordered";
import * as WorkflowitemAssign from "../service/domain/workflow/workflowitem_assigned";
import * as WorkflowitemCreated from "../service/domain/workflow/workflowitem_created";
import * as WorkflowitemUpdated from "../service/domain/workflow/workflowitem_updated";
import * as WorkflowitemClosed from "../service/domain/workflow/workflowitem_closed";
import * as WorkflowitemPermissionGranted from "../service/domain/workflow/workflowitem_permission_granted";
import * as WorkflowitemPermissionRevoked from "../service/domain/workflow/workflowitem_permission_revoked";

/**
 * What will not work anymout:
 *  Subproject.Update will not update amount
 *  Subporject.Create Projecected Budgets need to be respected
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

function mapOldEventToBusinessEvent(event, resources) {
  const stream = resources[0] ? resources[0].id : undefined;
  const key = [
    `${resources[1] ? resources[1].id : undefined}_workflows`,
    resources[2] ? resources[2].id : undefined,
  ];
  const data: Event = event;

  const params = [stream, key, data];
  const [a = undefined, b = undefined, request] = matchPublishRequest(params, stream, key, data);

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

  if (!captured || captured.length != 2) {
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

function matchPublishRequest(params: any[], stream, key, event: Event): any[] {
  switch (event.intent) {
    case "notification.create":
      // Check if it is an old notification event
      // if (!event.intent) {
      //   return params;
      // }

      // if (!event.data || !event.data.resources) {
      //   console.error("Error handling publish request for notification.create", params);
      //   return params;
      // }
      // const notificationCreated: NotificationCreated.Event = NotificationCreated.createEvent(
      //   event.data.notificationId,
      //   "http",
      //   event.createdBy,
      //   event.key,
      //   mapOldEventToBusinessEvent(event.data.originalEvent, event.data.resources),
      //   event.data.resources[0] ? event.data.resources[0].id : undefined,
      //   event.data.resources[1] ? event.data.resources[1].id : undefined,
      //   event.data.resources[2] ? event.data.resources[2].id : undefined,
      // );
      // return [stream, key, { json: notificationCreated }];
      return params;
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
        stream,
        {
          id: event.data.subproject.id,
          status: event.data.subproject.status,
          displayName: event.data.subproject.displayName,
          description: event.data.subproject.description,
          permissions: event.data.permissions,
          additionalData: {},
          assignee: event.data.subproject.assignee,
          currency: event.data.subproject.currency,
          projectedBudgets: event.data.subproject.projectedBudgets || [],
          closingDate: event.data.subproject.closingDate || new Date().toISOString(),

          //TODO: remove!
          billingDate: event.data.subproject.billingDate,
          amount: event.data.subproject.amount,
          exchangeRate: event.data.subproject.exchangeRate,
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
        stream,
        key[1],
        {
          displayName: event.data.displayName,
          description: event.data.description,
          additionalData: {},
          assignee: event.data.assignee,
          currency: event.data.currency,
          projectedBudgets: event.data.projectedBudgets || [],
          closingDate: event.data.closingDate || new Date().toISOString(),
        },
      );
      return [stream, key, { json: spUpdated }];
    }
    case "subproject.assign": {
      if (!event.data.identity) {
        console.error("Error handling publish request for subproject.assign", params);
        return params;
      }

      const spAssigned: SubprojectAssigned.Event = SubprojectAssigned.createEvent(
        "http",
        event.createdBy,
        stream,
        key[1],
        event.data.identity,
      );
      return [stream, key, { json: spAssigned }];
    }
    case "subproject.close": {
      if (!event.data) {
        console.error("Error handling publish request for subproject.close", params);
        return params;
      }

      const spClosed: SubprojectClosed.Event = SubprojectClosed.createEvent(
        "http",
        event.createdBy,
        stream,
        key[1],
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
        stream,
        key[1],
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
        stream,
        key[1],
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
        stream,
        event.key,
        event.data ? event.data : [],
      );
      return [stream, key, { json: wfReordered }];
    }
    case "subproject.createWorkflowitem": {
      const subProjectId = extractSubprojectFromKey(key[0]);

      if (!subProjectId || !event.data.workflowitem) {
        console.error("Error handling publish request for subproject.createWorkflowitem", params);
        return params;
      }
      const wfiCreated: WorkflowitemCreated.Event = WorkflowitemCreated.createEvent(
        "http",
        event.createdBy,
        stream,
        subProjectId,
        {
          id: event.data.workflowitem.id,
          status: event.data.workflowitem.status,
          displayName: event.data.workflowitem.displayName,
          description: event.data.workflowitem.description,
          amountType: event.data.workflowitem.amountType,
          documents: event.data.workflowitem.documents,
          permissions: event.data.permissions,
          additionalData: {},
          assignee: event.data.workflowitem.assignee,
          amount: event.data.workflowitem.amount,
          currency: event.data.workflowitem.currency,
          exchangeRate: event.data.workflowitem.exchangeRate,
          billingDate: event.data.workflowitem.billingDate,
          dueDate: event.data.workflowitem.dueDate,
        },
      );
      return [stream, key, { json: wfiCreated }];
    }
    case "workflowitem.update": {
      const subProjectId = extractSubprojectFromKey(key[0]);

      if (!subProjectId || !event.data) {
        console.error(
          "Error handling publish request for workflowitem.update",
          JSON.stringify(params, null, 2),
        );
        return params;
      }

      const wfiUpdated: WorkflowitemUpdated.Event = WorkflowitemUpdated.createEvent(
        "http",
        event.createdBy,
        stream,
        subProjectId,
        key[1],
        {
          displayName: event.data.displayName,
          description: event.data.description,
          amountType: event.data.amountType,
          documents: event.data.documents,
          additionalData: {},
          amount: event.data.amount,
          currency: event.data.currency,
          exchangeRate: event.data.exchangeRate,
          billingDate: event.data.billingDate,
          dueDate: event.data.dueDate,
        },
      );

      return [stream, key, { json: wfiUpdated }];
    }
    case "workflowitem.assign": {
      const subProjectId = extractSubprojectFromKey(key[0]);

      if (!subProjectId || !event.data.identity) {
        console.error("Error handling publish request for workflowitem.assign", params);
        return params;
      }

      const wfiAssigned: WorkflowitemAssign.Event = WorkflowitemAssign.createEvent(
        "http",
        event.createdBy,
        stream,
        subProjectId,
        key[1],
        event.data.identity,
      );
      return [stream, key, { json: wfiAssigned }];
    }
    case "workflowitem.close": {
      const subProjectId = extractSubprojectFromKey(key[0]);

      if (!subProjectId || !event.data) {
        console.error("Error handling publish request for workflowitem.close", params);
        return params;
      }

      const wfiClosed: WorkflowitemClosed.Event = WorkflowitemClosed.createEvent(
        "http",
        event.createdBy,
        stream,
        subProjectId,
        key[1],
      );
      return [stream, key, { json: wfiClosed }];
    }
    case "workflowitem.intent.grantPermission": {
      const subProjectId = extractSubprojectFromKey(key[0]);

      if (!subProjectId || !event.data) {
        console.error("Error handling publish request for workflowitem.close", params);
        return params;
      }

      const wfiGranted: WorkflowitemPermissionGranted.Event = WorkflowitemPermissionGranted.createEvent(
        "http",
        event.createdBy,
        stream,
        subProjectId,
        key[1],
        event.data.intent,
        event.data.identity,
      );
      return [stream, key, { json: wfiGranted }];
    }
    case "workflowitem.intent.revokePermission": {
      const subProjectId = extractSubprojectFromKey(key[0]);

      if (!subProjectId || !event.data) {
        console.error("Error handling publish request for workflowitem.close", params);
        return params;
      }

      const wfiGranted: WorkflowitemPermissionRevoked.Event = WorkflowitemPermissionRevoked.createEvent(
        "http",
        event.createdBy,
        stream,
        subProjectId,
        key[1],
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
    case "notification_created": {
      // const event: NotificationCreated.Event = result.data.json;

      // const oldEvent: Event = {
      //   key: event.recipient,
      //   intent: "notification.create",
      //   createdBy: event.publisher,
      //   createdAt: event.time,
      //   dataVersion: 1,
      //   data: {
      //     notificationId: event.id,
      //     resources: makeOldNotificationResources(
      //       event.projectId,
      //       event.subprojectId,
      //       event.workflowitemId,
      //     ),
      //     time: event.time,
      //     isRead: false,
      //     originalEvent: event.businessEvent,
      //   },
      // };
      // return { ...result, data: { json: oldEvent } };
      return result;
    }
    case "project_created":
    case "project_permission_granted":
    case "project_permission_revoked":
    case "project_assigned":
    case "project_updated":
    case "project_closed":
      return result;
    case "subproject_created": {
      const event: SubprojectCreated.Event = result.data.json;
      const oldEvent: Event = {
        key: event.subproject.id,
        intent: "project.createSubproject",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          subproject: {
            id: event.subproject.id,
            creationUnixTs: new Date(event.time).getTime(),
            status: event.subproject.status,
            displayName: event.subproject.displayName,
            description: event.subproject.description,
            amount: event.subproject.amount,
            currency: event.subproject.currency,
            exchangeRate: event.subproject.exchangeRate,
            billingDate: event.subproject.billingDate,
            assignee: event.subproject.assignee,
          },
          permissions: event.subproject.permissions,
        },
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "subproject_updated": {
      const event: SubprojectUpdated.Event = result.data.json;
      const oldEvent: Event = {
        key: event.subprojectId,
        intent: "subproject.update",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          displayName: event.subproject.displayName,
          description: event.subproject.description,
          currency: event.subproject.currency,

          // TODO: remove!
          amount: undefined,
          exchangeRate: undefined,
          billingDate: undefined,
        },
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "subproject_assigned": {
      const event: SubprojectAssigned.Event = result.data.json;
      const oldEvent: Event = {
        key: event.subprojectId,
        intent: "subproject.assign",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          identity: event.assignee,
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
    case "subproject_permission_revoked":
    case "workflowitems_reordered":
      {
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

      return result;
    case "workflowitem_assigned": {
      const event: WorkflowitemAssign.Event = result.data.json;
      const oldEvent: Event = {
        key: event.workflowitemId,
        intent: "workflowitem.assign",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          identity: event.assignee,
        },
      };
      return { ...result, data: { json: oldEvent } };
    }
    case "workflowitem_created": {
      const event: WorkflowitemCreated.Event = result.data.json;
      const oldEvent: Event = {
        key: event.workflowitem.id,
        intent: "subproject.createWorkflowitem",
        createdBy: event.publisher,
        createdAt: event.time,
        dataVersion: 1,
        data: {
          workflowitem: {
            id: event.workflowitem.id,
            creationUnixTs: new Date(event.time).getTime(),
            displayName: event.workflowitem.displayName,
            exchangeRate: event.workflowitem.exchangeRate,
            billingDate: event.workflowitem.billingDate,
            amount: event.workflowitem.amount,
            currency: event.workflowitem.currency,
            amountType: event.workflowitem.amountType,
            description: event.workflowitem.description,
            status: event.workflowitem.status,
            assignee: event.workflowitem.assignee,
            documents: event.workflowitem.documents,
          },
          permissions: event.workflowitem.permissions,
        },
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
          displayName: event.workflowitem.displayName,
          exchangeRate: event.workflowitem.exchangeRate,
          billingDate: event.workflowitem.billingDate,
          amount: event.workflowitem.amount,
          currency: event.workflowitem.currency,
          amountType: event.workflowitem.amountType,
          description: event.workflowitem.description,
          documents: event.workflowitem.documents,
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
