import logger from "../lib/logger";
import * as Result from "../result";
import { BusinessEvent } from "./domain/business_event";
import * as DocumentShared from "./domain/document/document_shared";
import * as DocumentUploaded from "./domain/document/document_uploaded";
import * as DocumentValidated from "./domain/document/document_validated";
import * as DocumentDeleted from "./domain/document/document_deleted";
import * as StorageServiceUrlUpdated from "./domain/document/storage_service_url_updated";
import * as NodesLogged from "./domain/network/nodes_logged";
import * as NodeDeclined from "./domain/network/node_declined";
import * as NodeRegistered from "./domain/network/node_registered";
import * as GroupCreated from "./domain/organization/group_created";
import * as GroupMemberAdded from "./domain/organization/group_member_added";
import * as GroupMemberRemoved from "./domain/organization/group_member_removed";
import * as PublicKeyPublished from "./domain/organization/public_key_published";
import * as PublicKeyUpdated from "./domain/organization/public_key_updated";
import * as UserCreated from "./domain/organization/user_created";
import * as UserDisabled from "./domain/organization/user_disabled";
import * as UserEnabled from "./domain/organization/user_enabled";
import * as UserPasswordChanged from "./domain/organization/user_password_changed";
import * as UserPermissionsGranted from "./domain/organization/user_permission_granted";
import * as UserPermissionsRevoked from "./domain/organization/user_permission_revoked";
import * as ProvisioningEnded from "./domain/system_information/provisioning_ended";
import * as ProvisioningStarted from "./domain/system_information/provisioning_started";
import * as GlobalPermissionsGranted from "./domain/workflow/global_permission_granted";
import * as GlobalPermissionsRevoked from "./domain/workflow/global_permission_revoked";
import * as NotificationCreated from "./domain/workflow/notification_created";
import * as NotificationMarkedRead from "./domain/workflow/notification_marked_read";
import * as ProjectAssigned from "./domain/workflow/project_assigned";
import * as ProjectClosed from "./domain/workflow/project_closed";
import * as ProjectCreated from "./domain/workflow/project_created";
import * as ProjectSnapshotPublished from "./domain/workflow/project_snapshot_published";
import * as ProjectPermissionsGranted from "./domain/workflow/project_permission_granted";
import * as ProjectPermissionsRevoked from "./domain/workflow/project_permission_revoked";
import * as ProjectProjectedBudgetDeleted from "./domain/workflow/project_projected_budget_deleted";
import * as ProjectProjectedBudgetUpdated from "./domain/workflow/project_projected_budget_updated";
import * as ProjectUpdated from "./domain/workflow/project_updated";
import * as SubprojectAssigned from "./domain/workflow/subproject_assigned";
import * as SubprojectSnapshotPublished from "./domain/workflow/subproject_snapshot_published";
import * as SubprojectClosed from "./domain/workflow/subproject_closed";
import * as SubprojectCreated from "./domain/workflow/subproject_created";
import * as SubprojectPermissionsGranted from "./domain/workflow/subproject_permission_granted";
import * as SubprojectPermissionsRevoked from "./domain/workflow/subproject_permission_revoked";
import * as SubprojectProjectedBudgetDeleted from "./domain/workflow/subproject_projected_budget_deleted";
import * as SubprojectProjectedBudgetUpdated from "./domain/workflow/subproject_projected_budget_updated";
import * as SubprojectUpdated from "./domain/workflow/subproject_updated";
import * as WorkflowitemsReordered from "./domain/workflow/workflowitems_reordered";
import * as WorkflowitemSnapshotPublished from "./domain/workflow/workflowitem_snapshot_published";
import * as WorkflowitemAssigned from "./domain/workflow/workflowitem_assigned";
import * as WorkflowitemClosed from "./domain/workflow/workflowitem_closed";
import * as WorkflowitemCreated from "./domain/workflow/workflowitem_created";
import * as WorkflowitemPermissionsGranted from "./domain/workflow/workflowitem_permission_granted";
import * as WorkflowitemPermissionsRevoked from "./domain/workflow/workflowitem_permission_revoked";
import * as WorkflowitemUpdated from "./domain/workflow/workflowitem_updated";
import { Item } from "./liststreamitems";
import * as ProjectEventSourcing from "./domain/workflow/project_eventsourcing";
import * as SubprojectEventSourcing from "./domain/workflow/subproject_eventsourcing";
import * as WorkflowitemEventSourcing from "./domain/workflow/workflowitem_eventsourcing";
import { WorkflowitemOrdering } from "./domain/workflow/workflowitem_ordering";

import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { VError } from "verror";
import { Subproject } from "./domain/workflow/subproject";
import { Project } from "./domain/workflow/project";
import { Workflowitem } from "./domain/workflow/workflowitem";
import getValidConfig from "../config";

const MAX_ITEM_COUNT = 0x7fffffff;

const SNAPSHOT_KEY = "snapshot";
const PROJECT_SNAPSHOT_EVENT_KEY = "project_snapshot_published";
const SUBPROJECT_SNAPSHOT_EVENT_KEY = "subproject_snapshot_published";
const WORKFLOWITEM_SNAPSHOT_EVENT_KEY = "workflowitem_snapshot_published";

const { snapshotEventInterval: SNAPSHOT_EVENT_INTERVAL } = getValidConfig();

export async function getLatestSnapshot(
  ctx: Ctx,
  conn: ConnToken,
  streamName: string,
  key: string,
  eventType: "project_snapshot_published",
): Promise<Result.Type<Project>>;

export async function getLatestSnapshot(
  ctx: Ctx,
  conn: ConnToken,
  streamName: string,
  key: string,
  eventType: "subproject_snapshot_published",
): Promise<Result.Type<Subproject>>;

export async function getLatestSnapshot(
  ctx: Ctx,
  conn: ConnToken,
  streamName: string,
  key: string,
  eventType: "workflowitem_snapshot_published",
): Promise<Result.Type<Workflowitem>>;

export async function getLatestSnapshot(
  ctx: Ctx,
  conn: ConnToken,
  streamName: string,
  key: string,
  eventType: string,
): Promise<Result.Type<Subproject> | Result.Type<Project> | Result.Type<Workflowitem>> {
  const { searchKey, sourceFromSnapshot, parseFromSnapshot } = getSourceInfo(key, eventType);

  if (searchKey.length === 0) {
    return new VError("Event Type is not a valid Snapshot type");
  }

  const itemsInfoResult = await getItemsInfo(conn, streamName, key, searchKey);
  if (Result.isErr(itemsInfoResult)) {
    return itemsInfoResult;
  }

  let { items, snapshotIndex } = itemsInfoResult;

  const lastIndex = items.length - 1;

  let data;
  if (snapshotIndex != -1) {
    switch (eventType) {
      case PROJECT_SNAPSHOT_EVENT_KEY:
        data = items[snapshotIndex].data.json.project;
        break;
      case SUBPROJECT_SNAPSHOT_EVENT_KEY:
        data = items[snapshotIndex].data.json.subproject;
        break;
      case WORKFLOWITEM_SNAPSHOT_EVENT_KEY:
        data = items[snapshotIndex].data.json.workflowitem;
        break;
    }
  }
  let lastOrderingEventItem;
  if (eventType == SUBPROJECT_SNAPSHOT_EVENT_KEY) {
    logger.trace("Event Subproject snapshot publish");
    const rpcClient = conn.multichainClient.getRpcClient();
    const items: Item[] = await rpcClient.invoke(
      "liststreamkeyitems",
      streamName,
      key + "_workflowitem_ordering",
      false,
      MAX_ITEM_COUNT,
    );
    // Parse workflow reorder events because they are separate events saved on chain
    if (items.length > 0) {
      lastOrderingEventItem = items[items.length - 1];
      logger.trace("Found WFI reordering");
      logger.trace("Last Reorder: " + lastOrderingEventItem.data.json.ordering);
    }
  }

  if (lastIndex == snapshotIndex) {
    const parsedData = parseFromSnapshot(data);
    if (lastOrderingEventItem && eventType === SUBPROJECT_SNAPSHOT_EVENT_KEY) {
      const lastOrdering: WorkflowitemOrdering = lastOrderingEventItem.data.json.ordering;
      const parsedSubproject = parsedData as Subproject;
      if (Result.isOk(parsedData) && lastOrdering !== parsedSubproject.workflowitemOrdering) {
        logger.trace("Last snapshot data is not equal to latest ordering");
        logger.trace("Snapshot order: " + parsedSubproject.workflowitemOrdering);
        logger.trace("Last Ordering order: " + lastOrdering);
        parsedSubproject.workflowitemOrdering = lastOrdering;
      }
    }
    return parsedData;
  }

  // snapshot is not up to date
  items = items.slice(snapshotIndex + 1);
  const parsedEvents = parseBusinessEvents(items, streamName);
  const businessEvents = parsedEvents.filter(Result.isOk);
  const sourcedData = sourceFromSnapshot(ctx, businessEvents, false, data);

  // if there are reordering events, apply it
  if (lastOrderingEventItem && eventType === SUBPROJECT_SNAPSHOT_EVENT_KEY) {
    const lastOrdering: WorkflowitemOrdering = lastOrderingEventItem.data.json.ordering;
    if (Result.isOk(sourcedData)) {
      sourcedData.workflowitemOrdering = lastOrdering;
    }
  }
  return sourcedData;
}

export async function publishSnapshot(
  ctx: Ctx,
  conn: ConnToken,
  streamName: string,
  key: string,
  eventType: string,
  creatingUser: ServiceUser,
  createEvent: Function,
  ordering?: WorkflowitemOrdering,
): Promise<{ canPublish: boolean; eventData: Result.Type<BusinessEvent> }> {
  const { searchKey, sourceFromSnapshot } = getSourceInfo(key, eventType);
  if (searchKey.length === 0) {
    return { canPublish: false, eventData: new VError("Event Type is not a valid Snapshot type") };
  }

  const itemsInfoResult = await getItemsInfo(conn, streamName, key, searchKey);
  if (Result.isErr(itemsInfoResult)) {
    return { canPublish: false, eventData: itemsInfoResult };
  }

  let { items, snapshotIndex } = itemsInfoResult;

  const lastIndex = items.length - 1;

  // if publishing snapshot first time, leave data undefined
  let data;

  if (snapshotIndex != -1) {
    // previous snapshot exists
    if (lastIndex - snapshotIndex < SNAPSHOT_EVENT_INTERVAL) {
      // do nothing, last snapshot is less than x events ago
      return {
        canPublish: false,
        eventData: new VError(
          "Cannot publish snapshot, last snapshot is less than" +
            SNAPSHOT_EVENT_INTERVAL +
            " events ago",
        ),
      };
    }
    switch (eventType) {
      case PROJECT_SNAPSHOT_EVENT_KEY:
        data = items[snapshotIndex].data.json.project;
        break;
      case SUBPROJECT_SNAPSHOT_EVENT_KEY:
        data = items[snapshotIndex].data.json.subproject;
        break;
      case WORKFLOWITEM_SNAPSHOT_EVENT_KEY:
        data = items[snapshotIndex].data.json.workflowitem;
        break;
    }
    items = items.slice(snapshotIndex + 1);
  }
  const parsedEvents = parseBusinessEvents(items, streamName);
  const businessEvents = parsedEvents.filter(Result.isOk);

  const sourcedData = sourceFromSnapshot(ctx, businessEvents, false, data);
  if (ordering && eventType === SUBPROJECT_SNAPSHOT_EVENT_KEY) {
    if (Result.isOk(sourcedData)) {
      sourcedData.workflowitemOrdering = ordering;
    }
  }
  let publishEvent: Result.Type<BusinessEvent>;
  if (eventType === WORKFLOWITEM_SNAPSHOT_EVENT_KEY) {
    publishEvent = createEvent(
      ctx.source,
      creatingUser.id,
      streamName,
      sourcedData.subprojectId,
      sourcedData,
    );
  } else {
    publishEvent = createEvent(ctx.source, creatingUser.id, sourcedData);
  }

  return { canPublish: true, eventData: publishEvent };
}

function getSourceInfo(
  key: string,
  eventType: string,
): { searchKey: string; sourceFromSnapshot: Function; parseFromSnapshot: Function } {
  let searchKey;
  let sourceFromSnapshot: Function;
  let parseFromSnapshot: Function;

  switch (eventType) {
    case PROJECT_SNAPSHOT_EVENT_KEY:
      searchKey = SNAPSHOT_KEY;
      sourceFromSnapshot = ProjectEventSourcing.sourceProjectFromSnapshot;
      parseFromSnapshot = ProjectEventSourcing.parseProjectFromSnapshot;
      break;
    case SUBPROJECT_SNAPSHOT_EVENT_KEY:
      searchKey = key + "_" + SNAPSHOT_KEY;
      sourceFromSnapshot = SubprojectEventSourcing.sourceSubprojectFromSnapshot;
      parseFromSnapshot = SubprojectEventSourcing.parseSubprojectFromSnapshot;
      break;
    case WORKFLOWITEM_SNAPSHOT_EVENT_KEY:
      searchKey = key + "_" + SNAPSHOT_KEY;
      sourceFromSnapshot = WorkflowitemEventSourcing.sourceWorkflowitemFromSnapshot;
      parseFromSnapshot = WorkflowitemEventSourcing.parseWorkflowitemFromSnapshot;
      break;
    default:
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type, @typescript-eslint/no-empty-function
      return { searchKey: "", sourceFromSnapshot: () => {}, parseFromSnapshot: () => {} };
  }
  return {
    searchKey: searchKey,
    sourceFromSnapshot: sourceFromSnapshot,
    parseFromSnapshot: parseFromSnapshot,
  };
}

async function getItemsInfo(
  conn: ConnToken,
  streamName: string,
  key: string,
  searchKey: string,
): Promise<Result.Type<{ items: Item[]; snapshotIndex: number }>> {
  const rpcClient = conn.multichainClient.getRpcClient();
  try {
    const items: Item[] = await rpcClient.invoke(
      "liststreamkeyitems",
      streamName,
      key,
      false,
      MAX_ITEM_COUNT,
    );
    if (items.length == 0) {
      return new VError("Data Not Found");
    }

    // Traverse the list reverse to get latest snapshot
    let snapshotIndex = -1;
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item.keys.includes(searchKey)) {
        snapshotIndex = i;
        break;
      }
    }

    return { items: items, snapshotIndex: snapshotIndex };
  } catch (e) {
    return new VError("Data Not Found");
  }
}

export function parseBusinessEvents(
  items: Item[],
  streamName: string,
): Array<Result.Type<BusinessEvent>> {
  return items.reduce(function (parsedEvents, item) {
    const event = item.data.json;
    if (!event) {
      logger.warn(`ignoring event no item.data.json property found ${JSON.stringify(item)}`);
      return parsedEvents;
    }

    if (event.intent) {
      logger.warn(`ignoring event of intent ${event.intent}`);
      return parsedEvents;
    }

    const parser = EVENT_PARSER_MAP[event.type];

    if (parser === undefined) {
      const eventType = event.type ? event.type : JSON.stringify(event);
      logger.fatal({ streamName, item }, `Cache: Event type "${eventType}"" not implemented.`);
      return parsedEvents;
    }
    parsedEvents.push(parser(event));
    return parsedEvents;
  }, [] as Result.Type<BusinessEvent>[]);
}

const EVENT_PARSER_MAP = {
  document_uploaded: DocumentUploaded.validate,
  document_deleted: DocumentDeleted.validate,
  secret_published: DocumentShared.validate,
  storage_service_url_published: StorageServiceUrlUpdated.validate,
  global_permission_granted: GlobalPermissionsGranted.validate,
  global_permission_revoked: GlobalPermissionsRevoked.validate,
  group_created: GroupCreated.validate,
  group_member_added: GroupMemberAdded.validate,
  group_member_removed: GroupMemberRemoved.validate,
  node_registered: NodeRegistered.validate,
  node_declined: NodeDeclined.validate,
  notification_created: NotificationCreated.validate,
  notification_marked_read: NotificationMarkedRead.validate,
  project_assigned: ProjectAssigned.validate,
  project_closed: ProjectClosed.validate,
  project_created: ProjectCreated.validate,
  project_snapshot_published: ProjectSnapshotPublished.validate,
  project_permission_granted: ProjectPermissionsGranted.validate,
  project_permission_revoked: ProjectPermissionsRevoked.validate,
  project_projected_budget_deleted: ProjectProjectedBudgetDeleted.validate,
  project_projected_budget_updated: ProjectProjectedBudgetUpdated.validate,
  project_updated: ProjectUpdated.validate,
  public_key_published: PublicKeyPublished.validate,
  public_key_updated: PublicKeyUpdated.validate,
  subproject_snapshot_published: SubprojectSnapshotPublished.validate,
  subproject_assigned: SubprojectAssigned.validate,
  subproject_closed: SubprojectClosed.validate,
  subproject_created: SubprojectCreated.validate,
  subproject_permission_granted: SubprojectPermissionsGranted.validate,
  subproject_permission_revoked: SubprojectPermissionsRevoked.validate,
  workflowitems_reordered: WorkflowitemsReordered.validate,
  subproject_projected_budget_deleted: SubprojectProjectedBudgetDeleted.validate,
  subproject_projected_budget_updated: SubprojectProjectedBudgetUpdated.validate,
  subproject_updated: SubprojectUpdated.validate,
  user_created: UserCreated.validate,
  user_password_changed: UserPasswordChanged.validate,
  user_enabled: UserEnabled.validate,
  user_disabled: UserDisabled.validate,
  user_permission_granted: UserPermissionsGranted.validate,
  user_permission_revoked: UserPermissionsRevoked.validate,
  workflowitem_snapshot_published: WorkflowitemSnapshotPublished.validate,
  workflowitem_assigned: WorkflowitemAssigned.validate,
  workflowitem_closed: WorkflowitemClosed.validate,
  workflowitem_created: WorkflowitemCreated.validate,
  workflowitem_permission_granted: WorkflowitemPermissionsGranted.validate,
  workflowitem_permission_revoked: WorkflowitemPermissionsRevoked.validate,
  workflowitem_updated: WorkflowitemUpdated.validate,
  workflowitem_document_validated: DocumentValidated.validate,
  peerinfo_saved: NodesLogged.validate,
  provisioning_started: ProvisioningStarted.validate,
  provisioning_ended: ProvisioningEnded.validate,
};
