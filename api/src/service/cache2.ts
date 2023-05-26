import { EventEmitter } from "events";
import { Ctx } from "../lib/ctx";
import { isEmpty } from "../lib/emptyChecks";
import logger from "../lib/logger";
import * as Result from "../result";
import { MultichainClient } from "./Client.h";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import * as DocumentShared from "./domain/document/document_shared";
import * as DocumentUploaded from "./domain/document/document_uploaded";
import * as DocumentValidated from "./domain/document/document_validated";
import * as StorageServiceUrlUpdated from "./domain/document/storage_service_url_updated";
import { NotFound } from "./domain/errors/not_found";
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
import * as Project from "./domain/workflow/project";
import * as ProjectAssigned from "./domain/workflow/project_assigned";
import * as ProjectClosed from "./domain/workflow/project_closed";
import * as ProjectCreated from "./domain/workflow/project_created";
import { sourceProjects } from "./domain/workflow/project_eventsourcing";
import * as ProjectPermissionsGranted from "./domain/workflow/project_permission_granted";
import * as ProjectPermissionsRevoked from "./domain/workflow/project_permission_revoked";
import * as ProjectProjectedBudgetDeleted from "./domain/workflow/project_projected_budget_deleted";
import * as ProjectProjectedBudgetUpdated from "./domain/workflow/project_projected_budget_updated";
import * as ProjectUpdated from "./domain/workflow/project_updated";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectAssigned from "./domain/workflow/subproject_assigned";
import * as SubprojectClosed from "./domain/workflow/subproject_closed";
import * as SubprojectCreated from "./domain/workflow/subproject_created";
import { sourceSubprojects } from "./domain/workflow/subproject_eventsourcing";
import * as SubprojectPermissionsGranted from "./domain/workflow/subproject_permission_granted";
import * as SubprojectPermissionsRevoked from "./domain/workflow/subproject_permission_revoked";
import * as SubprojectProjectedBudgetDeleted from "./domain/workflow/subproject_projected_budget_deleted";
import * as SubprojectProjectedBudgetUpdated from "./domain/workflow/subproject_projected_budget_updated";
import * as SubprojectUpdated from "./domain/workflow/subproject_updated";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemsReordered from "./domain/workflow/workflowitems_reordered";
import * as WorkflowitemAssigned from "./domain/workflow/workflowitem_assigned";
import * as WorkflowitemClosed from "./domain/workflow/workflowitem_closed";
import * as WorkflowitemCreated from "./domain/workflow/workflowitem_created";
import { sourceWorkflowitems } from "./domain/workflow/workflowitem_eventsourcing";
import * as WorkflowitemPermissionsGranted from "./domain/workflow/workflowitem_permission_granted";
import * as WorkflowitemPermissionsRevoked from "./domain/workflow/workflowitem_permission_revoked";
import * as WorkflowitemUpdated from "./domain/workflow/workflowitem_updated";
import { Item } from "./liststreamitems";

const STREAM_BLACKLIST = [
  // The organization address is written directly (i.e., not as event):
  "organization",
];

const CACHE_LOCK_RELEASED_EVENT = "release";

type StreamName = string;
type StreamCursor = { txid: string; index: number };

export type Cache2 = {
  ee: EventEmitter;
  // A lock is used to prevent sourcing updates concurrently:
  isWriteLocked: boolean;
  // How recent the cache is, in MultiChain terms:
  streamState: Map<StreamName, StreamCursor>;
  // The cached content:
  eventsByStream: Map<StreamName, BusinessEvent[]>;

  // Cached Aggregates:
  cachedProjects: Map<Project.Id, Project.Project>;
  cachedSubprojects: Map<Subproject.Id, Subproject.Subproject>;
  cachedWorkflowItems: Map<Workflowitem.Id, Workflowitem.Workflowitem>;

  // Lookup Tables for Aggregates
  cachedSubprojectLookup: Map<Project.Id, Set<Subproject.Id>>;
  cachedWorkflowitemLookup: Map<Subproject.Id, Set<Workflowitem.Id>>;
};

export function initCache(): Cache2 {
  return {
    ee: new EventEmitter(),
    isWriteLocked: false,
    streamState: new Map(),
    eventsByStream: new Map(),
    cachedProjects: new Map(),
    cachedSubprojects: new Map(),
    cachedWorkflowItems: new Map(),
    cachedSubprojectLookup: new Map(),
    cachedWorkflowitemLookup: new Map(),
  };
}

function clearCache(cache: Cache2): void {
  cache.ee.emit("release");
  cache.streamState.clear();
  cache.eventsByStream.clear();
  cache.cachedProjects.clear();
  cache.cachedSubprojects.clear();
  cache.cachedWorkflowItems.clear();
  cache.cachedSubprojectLookup.clear();
  cache.cachedWorkflowitemLookup.clear();
}

interface CacheInstance {
  getGlobalEvents(): BusinessEvent[];
  getSystemEvents(): BusinessEvent[];
  getUserEvents(userId?: string): BusinessEvent[];
  getGroupEvents(groupId?: string): BusinessEvent[];
  getNotificationEvents(userId: string): Result.Type<BusinessEvent[]>;
  getPublicKeyEvents(): Result.Type<BusinessEvent[]>;

  // Project:
  getProjects(): Promise<Project.Project[]>;
  getProject(projectId: string): Promise<Result.Type<Project.Project>>;

  // Subproject:
  getSubprojects(projectId: string): Promise<Result.Type<Subproject.Subproject[]>>;
  getSubproject(projectId: string, subprojectId: string): Result.Type<Subproject.Subproject>;

  // Workflowitem:
  getWorkflowitems(
    _projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
  getWorkflowitem(
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getDocumentUploadedEvents(): Result.Type<BusinessEvent[]>;
  getStorageServiceUrlPublishedEvents(): Result.Type<BusinessEvent[]>;
  getSecretPublishedEvents(): Result.Type<BusinessEvent[]>;
}

export function getCacheInstance(ctx: Ctx, cache: Cache2): CacheInstance {
  return {
    getGlobalEvents: (): BusinessEvent[] => {
      logger.trace("Getting global Events from cache");
      return cache.eventsByStream.get("global") || [];
    },
    //system_information
    getSystemEvents: (): BusinessEvent[] => {
      logger.trace("Getting system Events from cache");
      return cache.eventsByStream.get("system_information") || [];
    },

    getUserEvents: (_userId?: string): BusinessEvent[] => {
      logger.trace("Getting user events from cache");
      // userId currently not leveraged
      return cache.eventsByStream.get("users") || [];
    },

    getGroupEvents: (_groupId?: string): BusinessEvent[] => {
      logger.trace("Getting group events from cache");
      // groupId currently not leveraged
      return cache.eventsByStream.get("groups") || [];
    },

    getNotificationEvents: (userId: string): Result.Type<BusinessEvent[]> => {
      logger.trace("Getting Notification Events from cache");

      const userFilter = (event): Event | Error | boolean => {
        if (!event.type.startsWith("notification_")) {
          logger.debug(`Unexpected event type in "notifications" stream: ${event.type}`);
          return false;
        }

        switch (event.type) {
          case "notification_created":
            return event.recipient === userId;
          case "notification_marked_read":
            return event.recipient === userId;
          default:
            return Error(`not implemented: notification event of type ${event.type}`);
        }
      };

      return (cache.eventsByStream.get("notifications") || []).filter(userFilter);
    },

    getPublicKeyEvents: (): Result.Type<BusinessEvent[]> => {
      logger.trace("Getting public key events from cache");
      return cache.eventsByStream.get("public_keys") || [];
    },
    getDocumentUploadedEvents: (): Result.Type<BusinessEvent[]> => {
      logger.trace("Getting document uploaded events");
      const documentFilter = (event): boolean => {
        switch (event.type) {
          case "document_uploaded":
            return true;
          case "storage_service_url_published":
            return true;
          default:
            return false;
        }
      };
      return (cache.eventsByStream.get("documents") || []).filter(documentFilter);
    },
    getStorageServiceUrlPublishedEvents: (): Result.Type<BusinessEvent[]> => {
      logger.trace("Getting storageserviceurl-published events from cache");
      const storageServiceUrlFilter = (event): boolean => {
        switch (event.type) {
          case "storage_service_url_published":
            return true;
          default:
            return false;
        }
      };
      return (cache.eventsByStream.get("documents") || []).filter(storageServiceUrlFilter);
    },
    getSecretPublishedEvents: (): Result.Type<BusinessEvent[]> => {
      logger.trace("Getting Secret published events from cache");
      const secretPhublishedFilter = (event): boolean => {
        switch (event.type) {
          case "secret_published":
            return true;
          default:
            return false;
        }
      };
      return (cache.eventsByStream.get("documents") || []).filter(secretPhublishedFilter);
    },

    getProjects: async (): Promise<Project.Project[]> => {
      logger.trace("Getting projects from cache");
      return [...cache.cachedProjects.values()];
    },

    getProject: async (projectId: string): Promise<Result.Type<Project.Project>> => {
      logger.trace(`Getting Project with id "${projectId}" from cache`);
      const project = cache.cachedProjects.get(projectId);
      if (project === undefined) {
        return new NotFound(ctx, "project", projectId);
      }
      return project;
    },

    getSubprojects: async (projectId: string): Promise<Result.Type<Subproject.Subproject[]>> => {
      logger.trace("Getting subprojects from cache");

      // Look up subproject ids
      const subprojectIDs = cache.cachedSubprojectLookup.get(projectId);
      if (subprojectIDs === undefined) {
        // Check if the project exists. If yes, it simply contains no subprojects
        const project = cache.cachedProjects.get(projectId);
        return project === undefined ? new NotFound(ctx, "project", projectId) : [];
      }

      const subprojects: Subproject.Subproject[] = [];
      for (const id of subprojectIDs) {
        const sp = cache.cachedSubprojects.get(id);
        if (sp === undefined) {
          return new NotFound(ctx, "subproject", id);
        }
        subprojects.push(sp);
      }
      return subprojects;
    },

    getSubproject: (
      _projectId: string,
      subprojectId: string,
    ): Result.Type<Subproject.Subproject> => {
      logger.trace(
        `Getting Subproject from project ${_projectId} with id "${subprojectId}" from cache`,
      );
      const subproject = cache.cachedSubprojects.get(subprojectId);
      if (subproject === undefined) {
        return new NotFound(ctx, "subproject", subprojectId);
      }
      return subproject;
    },

    getWorkflowitems: async (
      _projectId: string,
      subprojectId: string,
    ): Promise<Result.Type<Workflowitem.Workflowitem[]>> => {
      logger.trace("Getting workflowitems from cache");
      const workflowitemIDs = cache.cachedWorkflowitemLookup.get(subprojectId);
      const workflowitems: Workflowitem.Workflowitem[] = [];
      if (workflowitemIDs === undefined) {
        // Check if the subproject exists. If yes, it simply contains no workflowitems
        const subproject = cache.cachedSubprojects.get(subprojectId);
        return subproject === undefined ? new NotFound(ctx, "subproject", subprojectId) : [];
      }

      for (const id of workflowitemIDs) {
        const wf = cache.cachedWorkflowItems.get(id);
        if (wf === undefined) {
          return new NotFound(ctx, "workflowitem", id);
        }
        workflowitems.push(wf);
      }
      return workflowitems;
    },

    getWorkflowitem: async (
      _projectId: string,
      _subprojectId: string,
      workflowitemId: string,
    ): Promise<Result.Type<Workflowitem.Workflowitem>> => {
      logger.trace(
        `Getting Workflowitem from project ${_projectId} and ${_subprojectId} with id "${workflowitemId}" from cache`,
      );

      const workflowitem = cache.cachedWorkflowItems.get(workflowitemId);
      if (workflowitem === undefined) {
        return new NotFound(ctx, "workflowitem", workflowitemId);
      }
      return workflowitem;
    },
  };
}

export type TransactionFn<T> = (cache: CacheInstance) => Promise<T>;

export async function withCache<T>(
  conn: ConnToken,
  ctx: Ctx,
  transaction: TransactionFn<T>,
  doRefresh = false,
): Promise<T> {
  const cache = conn.cache2;

  const cacheInstance: CacheInstance = getCacheInstance(ctx, cache);

  try {
    // Make sure we're the only thread-of-execution:
    await grabWriteLock(cache);

    // The cache is updated only once, before running the user code.
    // Currently, this simply fetches new items for _all_ streams; when the number of
    // streams grows large, it might make sense to do this more fine-grained here.
    if (doRefresh) {
      logger.error("updating cache from withCache");
      await updateCache(ctx, conn);
    }

    // eslint-disable-next-line @typescript-eslint/return-await
    return transaction(cacheInstance);
  } finally {
    releaseWriteLock(cache);
  }
}

export async function refreshCache(conn: ConnToken, ctx: Ctx): Promise<void> {
  const cache = conn.cache2;
  try {
    // Make sure we're the only thread-of-execution:
    await grabWriteLock(cache);
    await updateCache(ctx, conn);
  } finally {
    releaseWriteLock(cache);
  }
}

export async function invalidateCache(conn: ConnToken): Promise<void> {
  const cache = conn.cache2;
  try {
    // Make sure we're the only thread-of-execution:
    await grabWriteLock(cache);
    // Invalidate the cache by removing all of its data:
    clearCache(cache);
  } finally {
    releaseWriteLock(cache);
  }
}

async function grabWriteLock(cache: Cache2): Promise<void> {
  return new Promise((resolve) => {
    // If nobody has the lock, take it and resolve immediately
    if (!cache.isWriteLocked) {
      cache.isWriteLocked = true;
      return resolve();
    }

    // Otherwise, wait until somebody releases the lock and try again
    const tryAcquire = (): void => {
      if (!cache.isWriteLocked) {
        cache.isWriteLocked = true;
        cache.ee.removeListener(CACHE_LOCK_RELEASED_EVENT, tryAcquire);
        return resolve();
      }
    };
    cache.ee.on(CACHE_LOCK_RELEASED_EVENT, tryAcquire);
  });
}

function releaseWriteLock(cache: Cache2): void {
  cache.isWriteLocked = false;
  setImmediate(() => cache.ee.emit(CACHE_LOCK_RELEASED_EVENT));
}

async function findStartIndex(
  multichainClient: MultichainClient,
  streamName: string,
  cursor?: StreamCursor,
): Promise<number> {
  if (cursor === undefined) return 0;
  const rpcClient = multichainClient.getRpcClient();
  const verbose = false;
  const count = 1;
  const start = cursor.index;
  const items: Item[] = await rpcClient.invoke(
    "liststreamitems",
    streamName,
    verbose,
    count,
    start,
  );
  if (items.length !== 1) return 0;
  const item = items[0];
  return item.txid === cursor.txid ? cursor.index + 1 : 0;
}

async function updateCache(ctx: Ctx, conn: ConnToken, onlyStreamName?: string): Promise<void> {
  // Let's gather some statistics:
  let nUpdatedStreams = 0;
  let nRebuiltStreams = 0;
  const startTime = process.hrtime();

  const { cache2: cache } = conn;

  // The cache contains all streams that have "kind" in their details (e.g., the "root"
  // stream doesn't have this as it's created by MultiChain and not used by TruBudget)
  // and are not excluded by the STREAM_BLACKLIST:
  const streams = (await conn.multichainClient.streams(onlyStreamName)).filter(
    (stream) =>
      stream.details.kind !== undefined &&
      !STREAM_BLACKLIST.includes(stream.details.kind as string),
  );

  for (const { name: streamName, items: nStreamItems } of streams) {
    if (nStreamItems === 0) {
      if (logger.levelVal >= logger.levels.values.debug) {
        const stream = streams.find((x) => x.name === streamName);
        logger.debug({ stream }, `Found empty stream ${streamName}`);
      }
      continue;
    }

    const cursor = cache.streamState.get(streamName);

    // If the number of items hasn't changed, we don't need to check for changes. Even if
    // the last item has changed in the meantime, we'll pick up the change along with the
    // next. And since MultiChain likely merges events when mining blocks rather than
    // replacing them, a changed item without a following new item is quite unlikely.
    if (cursor !== undefined && cursor.index === nStreamItems - 1) {
      logger.trace({ streamName, nStreamItems, cursor }, `Cache2 hit for stream ${streamName}`);
      continue;
    }

    const newItems: Item[] = [];

    let first = await findStartIndex(conn.multichainClient, streamName, cursor);
    const isRebuild = cursor === undefined || first !== cursor.index + 1;
    logger.trace(
      { streamName, nStreamItems, cursor },
      `Cache2 miss for stream ${streamName} (full rebuild: ${isRebuild ? "yes" : "no"})`,
    );
    const batchSize = 100;
    let batch: Item[] = [];
    const rpcClient = conn.multichainClient.getRpcClient();
    while ((batch = await rpcClient.retrieveItems(streamName, first, batchSize)).length > 0) {
      logger.trace({ batch });
      newItems.push(...batch);
      first += batch.length;
    }

    // It would be nice to have a `panic!` macro, but whatever:
    if (isRebuild && (!newItems.length || !first)) {
      logger.fatal(
        { streamName, nStreamItems, cursor, first, isRebuild, newItems },
        "Found a bug!",
      );
      process.exit(1);
    }
    logger.trace({ streamName, nStreamItems, cursor, first, isRebuild, newItems });

    let cursorToLastItem: StreamCursor | undefined = cursor;
    // If there are new items, we update the cursor to point to the latest one:
    const lastIndex = first - 1;
    const lastTxid = newItems[newItems.length - 1].txid;
    cursorToLastItem = { index: lastIndex, txid: lastTxid };

    if (cursorToLastItem !== undefined) {
      cache.streamState.set(streamName, cursorToLastItem);
    }

    if (isRebuild) {
      ++nRebuiltStreams;
    } else {
      ++nUpdatedStreams;
    }

    const parsedEvents = parseBusinessEvents(newItems, streamName);

    const businessEvents = parsedEvents.filter(Result.isOk);
    if (isRebuild) {
      // clear cache
      cache.eventsByStream.delete(streamName);
    }
    addEventsToCache(cache, streamName, businessEvents);

    updateAggregates(ctx, cache, businessEvents);

    if (logger.levelVal >= logger.levels.values.warn) {
      parsedEvents.filter(Result.isErr).forEach((x) => logger.warn(x));
    }
  }

  if (logger.levelVal >= logger.levels.values.debug) {
    // Returns [seconds, nanoseconds]:
    const hrtimeDiff = process.hrtime(startTime);
    const elapsedMilliseconds = (hrtimeDiff[0] * 1e9 + hrtimeDiff[1]) / 1e6;
    logger.debug(
      cache.streamState,
      `Stream cache updated in ${elapsedMilliseconds} ms: ${streams.length} streams (${nUpdatedStreams} updated, ${nRebuiltStreams} rebuilt)`,
    );
  }
}

function addEventsToCache(cache: Cache2, streamName: string, newEvents: BusinessEvent[]): void {
  switch (streamName) {
    case "global":
    case "users":
    case "groups":
    case "notifications":
    case "public_keys":
    case "documents":
    case "system_information":
      const eventsSoFar = cache.eventsByStream.get(streamName) || [];
      cache.eventsByStream.set(streamName, eventsSoFar.concat(newEvents));
      break;

    default:
      // Do nothing, because informations will be reflected in aggregates
      break;
  }
}

export function updateAggregates(ctx: Ctx, cache: Cache2, newEvents: BusinessEvent[]): void {
  const { projects, errors: pErrors = [] } = sourceProjects(ctx, newEvents, cache.cachedProjects);
  if (!isEmpty(pErrors)) logger.error({ err: pErrors }, "sourceProject caused error");

  for (const project of projects) {
    cache.cachedProjects.set(project.id, project);
  }

  const { subprojects, errors: spErrors = [] } = sourceSubprojects(
    ctx,
    newEvents,
    cache.cachedSubprojects,
  );
  if (!isEmpty(spErrors)) logger.error({ err: spErrors }, "sourceSubproject caused error: ");

  for (const subproject of subprojects) {
    cache.cachedSubprojects.set(subproject.id, subproject);

    const lookUp = cache.cachedSubprojectLookup.get(subproject.projectId);
    if (lookUp === undefined) {
      cache.cachedSubprojectLookup.set(subproject.projectId, new Set([subproject.id]));
    } else {
      lookUp.add(subproject.id);
    }
  }

  const { workflowitems, errors: wErrors = [] } = sourceWorkflowitems(
    ctx,
    newEvents,
    cache.cachedWorkflowItems,
  );
  if (!isEmpty(wErrors)) logger.error({ err: wErrors }, "sourceWorkflowitems caused error: ");

  for (const workflowitem of workflowitems) {
    cache.cachedWorkflowItems.set(workflowitem.id, workflowitem);
    const lookUp = cache.cachedWorkflowitemLookup.get(workflowitem.subprojectId);
    if (lookUp === undefined) {
      cache.cachedWorkflowitemLookup.set(workflowitem.subprojectId, new Set([workflowitem.id]));
    } else {
      lookUp.add(workflowitem.id);
    }
  }
}

const EVENT_PARSER_MAP = {
  document_uploaded: DocumentUploaded.validate,
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
  project_permission_granted: ProjectPermissionsGranted.validate,
  project_permission_revoked: ProjectPermissionsRevoked.validate,
  project_projected_budget_deleted: ProjectProjectedBudgetDeleted.validate,
  project_projected_budget_updated: ProjectProjectedBudgetUpdated.validate,
  project_updated: ProjectUpdated.validate,
  public_key_published: PublicKeyPublished.validate,
  public_key_updated: PublicKeyUpdated.validate,
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

export function parseBusinessEvents(
  items: Item[],
  streamName: string,
): Array<Result.Type<BusinessEvent>> {
  return items
    .map((item) => {
      const event = item.data.json;
      if (!event) {
        logger.warn(`ignoring event no item.data.json property found ${JSON.stringify(item)}`);
        return;
      }
      if (event.intent) {
        logger.warn(`ignoring event of intent ${event.intent}`);
        return;
      }
      const parser = EVENT_PARSER_MAP[event.type];
      if (parser === undefined) {
        const eventType = event && event.type ? event.type : JSON.stringify(event);
        logger.fatal({ streamName, item }, `Cache: Event type "${eventType}"" not implemented.`);
        return;
      }
      return parser(event);
    })
    .filter((x) => x !== undefined);
}
