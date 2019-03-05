import { Event } from "./event";
import * as WorkflowitemAssign from "../service/domain/workflow/workflowitem_assigned";
import * as WorkflowitemCreated from "../service/domain/workflow/workflowitem_created";
import * as WorkflowitemUpdated from "../service/domain/workflow/workflowitem_updated";
import * as WorkflowitemClosed from "../service/domain/workflow/workflowitem_closed";
import * as WorkflowitemPermissionGranted from "../service/domain/workflow/workflowitem_permission_granted";
import * as WorkflowitemPermissionRevoked from "../service/domain/workflow/workflowitem_permission_revoked";

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

  switch (event.intent) {
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
      console.log(method, params);
      return oldResult;

    default:
      return oldResult;
  }
}
