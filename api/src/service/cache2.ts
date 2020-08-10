import { Ctx } from "../lib/ctx";
import { isEmpty } from "../lib/emptyChecks";
import logger from "../lib/logger";
import * as Result from "../result";
import { MultichainClient } from "./Client.h";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { NotFound } from "./domain/errors/not_found";
import * as NodeRegistered from "./domain/network/node_registered";
import * as GroupCreated from "./domain/organization/group_created";
import * as GroupMemberAdded from "./domain/organization/group_member_added";
import * as GroupMemberRemoved from "./domain/organization/group_member_removed";
import * as UserCreated from "./domain/organization/user_created";
import * as UserPasswordChanged from "./domain/organization/user_password_changed";
import * as UserEnabled from "./domain/organization/user_enabled";
import * as UserDisabled from "./domain/organization/user_disabled";
import * as UserPermissionsGranted from "./domain/organization/user_permission_granted";
import * as UserPermissionsRevoked from "./domain/organization/user_permission_revoked";
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
import * as WorkflowitemAssigned from "./domain/workflow/workflowitem_assigned";
import * as WorkflowitemClosed from "./domain/workflow/workflowitem_closed";
import * as WorkflowitemCreated from "./domain/workflow/workflowitem_created";
import { sourceWorkflowitems } from "./domain/workflow/workflowitem_eventsourcing";
import * as WorkflowitemPermissionsGranted from "./domain/workflow/workflowitem_permission_granted";
import * as WorkflowitemPermissionsRevoked from "./domain/workflow/workflowitem_permission_revoked";
import * as WorkflowitemUpdated from "./domain/workflow/workflowitem_updated";
import * as WorkflowitemsReordered from "./domain/workflow/workflowitems_reordered";
import * as WorkflowitemDocumentUploaded from "./domain/workflow/workflowitem_document_uploaded";

import { Item } from "./liststreamitems";

const STREAM_BLACKLIST = [
  // The organization address is written directly (i.e., not as event):
  "organization",
  "offchain_documents",
];

type StreamName = string;
type StreamCursor = { txid: string; index: number };

export type Cache2 = {
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
  getUserEvents(userId?: string): BusinessEvent[];
  getGroupEvents(groupId?: string): BusinessEvent[];
  getNotificationEvents(userId: string): Result.Type<BusinessEvent[]>;

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
}

export function getCacheInstance(ctx: Ctx, cache: Cache2): CacheInstance {
  return {
    getGlobalEvents: (): BusinessEvent[] => {
      return cache.eventsByStream.get("global") || [];
    },

    getUserEvents: (_userId?: string): BusinessEvent[] => {
      // userId currently not leveraged
      return cache.eventsByStream.get("users") || [];
    },

    getGroupEvents: (_groupId?: string): BusinessEvent[] => {
      // groupId currently not leveraged
      return cache.eventsByStream.get("groups") || [];
    },

    getNotificationEvents: (userId: string): Result.Type<BusinessEvent[]> => {
      const userFilter = (event) => {
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

    getProjects: async (): Promise<Project.Project[]> => {
      return [...cache.cachedProjects.values()];
    },

    getProject: async (projectId: string): Promise<Result.Type<Project.Project>> => {
      const projects = [...cache.cachedProjects.values()];
      const project = projects.find((x) => x.id === projectId);
      if (project === undefined) {
        return new NotFound(ctx, "project", projectId);
      }
      return project;
    },

    getSubprojects: async (projectId: string): Promise<Result.Type<Subproject.Subproject[]>> => {
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
  doRefresh: boolean = true,
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
      await updateCache(ctx, conn);
    }

    return transaction(cacheInstance);
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

async function grabWriteLock(cache: Cache2) {
  while (cache.isWriteLocked) {
    await new Promise((res) => setTimeout(res, 1));
  }
  cache.isWriteLocked = true;
}

function releaseWriteLock(cache: Cache2) {
  cache.isWriteLocked = false;
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

async function fetchItems(
  multichainClient: MultichainClient,
  streamName: string,
  start: number,
  count: number,
): Promise<Item[]> {
  const rpcClient = multichainClient.getRpcClient();
  const verbose = false;
  const items: Item[] = await rpcClient.invoke(
    "liststreamitems",
    streamName,
    verbose,
    count,
    start,
  );
  for (const item of items) {
    if (item.data && item.data.hasOwnProperty("vout") && item.data.hasOwnProperty("txid")) {
      item.data = await this.rpcClient.invoke("gettxoutdata", item.data.txid, item.data.vout);
    }
  }
  return items;
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
      stream.details.kind !== undefined && !STREAM_BLACKLIST.includes(stream.details.kind as any),
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
    while (
      (batch = await fetchItems(conn.multichainClient, streamName, first, batchSize)).length > 0
    ) {
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

function addEventsToCache(cache: Cache2, streamName: string, newEvents: BusinessEvent[]) {
  switch (streamName) {
    case "global":
    case "users":
    case "groups":
    case "notifications":
      const eventsSoFar = cache.eventsByStream.get(streamName) || [];
      cache.eventsByStream.set(streamName, eventsSoFar.concat(newEvents));
      break;

    default:
      // Do nothing, because informations will be reflected in aggregates
      break;
  }
}

export function updateAggregates(ctx: Ctx, cache: Cache2, newEvents: BusinessEvent[]) {
  const { projects, errors: pErrors = [] } = sourceProjects(ctx, newEvents, cache.cachedProjects);
  if (!isEmpty(pErrors)) logger.debug("sourceProject caused error: ", pErrors);

  for (const project of projects) {
    cache.cachedProjects.set(project.id, project);
  }

  const { subprojects, errors: spErrors = [] } = sourceSubprojects(
    ctx,
    newEvents,
    cache.cachedSubprojects,
  );
  if (!isEmpty(spErrors)) logger.debug("sourceSubproject caused error: ", spErrors);

  for (const subproject of subprojects) {
    cache.cachedSubprojects.set(subproject.id, subproject);

    const lookUp = cache.cachedSubprojectLookup.get(subproject.projectId);
    lookUp === undefined
      ? cache.cachedSubprojectLookup.set(subproject.projectId, new Set([subproject.id]))
      : lookUp.add(subproject.id);
  }

  const { workflowitems, errors: wErrors = [] } = sourceWorkflowitems(
    ctx,
    newEvents,
    cache.cachedWorkflowItems,
  );
  if (!isEmpty(wErrors)) logger.debug("sourceWorkflowitems caused error: ", wErrors);

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
  global_permission_granted: GlobalPermissionsGranted.validate,
  global_permission_revoked: GlobalPermissionsRevoked.validate,
  group_created: GroupCreated.validate,
  group_member_added: GroupMemberAdded.validate,
  group_member_removed: GroupMemberRemoved.validate,
  node_registered: NodeRegistered.validate,
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
  workflowitem_document_uploaded: WorkflowitemDocumentUploaded.validate,
};

export function parseBusinessEvents(
  items: Item[],
  streamName: string,
): Array<Result.Type<BusinessEvent>> {
  return items
    .map((item) => {
      const event = item.data.json;
      if (event.intent) {
        logger.debug(`cache2: ignoring event of intent ${event.intent}`);
        return;
      }
      const parser = EVENT_PARSER_MAP[event.type];
      if (parser === undefined) {
        const eventType = event && event.type ? event.type : JSON.stringify(event);
        logger.fatal(
          { streamName, item },
          "Cache: Event type not implemented. Please file an issue and include this log entry - thank you.",
        );
        process.exit(1);
      }
      return parser(event);
    })
    .filter((x) => x !== undefined);
}
