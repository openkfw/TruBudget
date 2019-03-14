import Intent from "../authz/intents";
import deepcopy from "../lib/deepcopy";
import logger from "../lib/logger";
import { MultichainClient, Stream } from "./Client.h";
import { ConnToken } from "./conn";
import * as Eventsourcing from "./eventsourcing";
import { Item } from "./liststreamitems";
import * as ProjectEvents from "./ProjectEvents";

// Currently the project-stream cache doesn't quite work:
// Projects aren't updated as long as the items count in the project-stream list doesn't
// change, so fixing the latter also fixes the former.
// Set to zero to disable this:
const PROJECT_STREAMS_MILLISECONDS_TO_LIVE = 0;

type StreamName = string;
type StreamCursor = { txid: string; index: number };

export type Cache = {
  // A lock is used to prevent sourcing updates concurrently:
  isWriteLocked: boolean;
  // How recent the cache is, in MultiChain terms:
  streamState: Map<StreamName, StreamCursor>;
  // Cached project streams, to be invalidated regularly and after project.create:
  projectStreams?: Stream[];
  // The cached content:
  projects: Map<string, Eventsourcing.Project>;
};

export function initCache(): Cache {
  return {
    isWriteLocked: false,
    streamState: new Map(),
    projectStreams: undefined,
    projects: new Map(),
  };
}

export async function tellCacheWhatHappened(cache: Cache, whatHappened: Intent): Promise<void> {
  if (whatHappened === "global.createProject" && PROJECT_STREAMS_MILLISECONDS_TO_LIVE > 0) {
    logger.debug("global.createProject => invalidating project-stream cache..");
    await invalidateProjectStreamsCache(cache);
  }
}

async function invalidateProjectStreamsCache(cache: Cache): Promise<void> {
  if (PROJECT_STREAMS_MILLISECONDS_TO_LIVE > 0) {
    await grabWriteLock(cache);
    cache.projectStreams = undefined;
    logger.debug("project-stream cache invalidated");
    releaseWriteLock(cache);
  }
}

async function grabWriteLock(cache: Cache) {
  while (cache.isWriteLocked) {
    await new Promise(res => setTimeout(res, 1));
  }
  cache.isWriteLocked = true;
}

function releaseWriteLock(cache: Cache) {
  cache.isWriteLocked = false;
}

function dropSubprojects(x: Eventsourcing.Project): ProjectEvents.Project {
  return {
    id: x.id,
    creationUnixTs: x.creationUnixTs,
    status: x.status,
    displayName: x.displayName,
    assignee: x.assignee,
    description: x.description,
    projectedBudgets: x.projectedBudgets,
    thumbnail: x.thumbnail,
    permissions: deepcopy(x.permissions),
    log: deepcopy(x.log),
  };
}

export async function getAndCacheProject(
  conn: ConnToken,
  projectId: string,
): Promise<ProjectEvents.Project> {
  const { cache } = conn;

  try {
    // Make sure we're the only thread-of-execution that updates the cache:
    await grabWriteLock(cache);

    await updateCache(conn);

    // Return cached:
    const project = cache.projects.get(projectId);
    return project !== undefined
      ? dropSubprojects(project)
      : Promise.reject(Error(`Project ${projectId} not found`));
  } finally {
    releaseWriteLock(cache);
  }
}

export async function getAndCacheProjectList(conn: ConnToken): Promise<ProjectEvents.Project[]> {
  const { cache } = conn;

  try {
    // Make sure we're the only thread-of-execution that updates the cache:
    await grabWriteLock(cache);

    await updateCache(conn);

    // Return cached:
    return [...cache.projects.values()].map(dropSubprojects);
  } finally {
    releaseWriteLock(cache);
  }
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

async function getProjectStreams(conn: ConnToken, projectId?: string): Promise<Stream[]> {
  const { cache, multichainClient } = conn;
  const isStreamCacheEnabled = PROJECT_STREAMS_MILLISECONDS_TO_LIVE > 0;
  if (projectId !== undefined) {
    if (isStreamCacheEnabled && cache.projectStreams !== undefined) {
      return cache.projectStreams.filter(x => x.name === projectId);
    } else {
      // liststreams also gives us streams from the mempool (with confirmed=0).
      return await multichainClient.streams(projectId);
    }
  } else {
    // projectId is not set, so we need the list of _all_ projects.

    if (isStreamCacheEnabled && cache.projectStreams !== undefined) {
      return cache.projectStreams;
    } else {
      // liststreams also gives us streams from the mempool (with confirmed=0).
      const streams = await conn.multichainClient.streams();

      // We only cache projects, so we reject all other streams:
      cache.projectStreams = streams.filter(x => x.details.kind === "project");

      // Invalidate the cached data eventually:
      setTimeout(() => invalidateProjectStreamsCache(cache), PROJECT_STREAMS_MILLISECONDS_TO_LIVE);

      return cache.projectStreams;
    }
  }
}

async function updateCache(conn: ConnToken, maybeOnlySpecificProject?: string): Promise<void> {
  // Let's gather some statistics:
  let nUpdatedProjects = 0;
  let nRebuiltProjects = 0;
  const startTime = process.hrtime();

  const { cache } = conn;

  const projectStreams = await getProjectStreams(conn, maybeOnlySpecificProject);

  for (const { name: streamName, items: nStreamItems } of projectStreams) {
    if (nStreamItems === 0) {
      if (logger.levelVal >= logger.levels.values.debug) {
        const stream = projectStreams.find(x => x.name === streamName);
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
      logger.trace({ streamName, nStreamItems, cursor }, `Cache hit for stream ${streamName}`);
      continue;
    }

    const newItems: Item[] = [];

    let first = await findStartIndex(conn.multichainClient, streamName, cursor);
    const isRebuild = cursor === undefined || first !== cursor.index + 1;
    logger.trace(
      { streamName, nStreamItems, cursor },
      `Cache miss for stream ${streamName} (full rebuild: ${isRebuild ? "yes" : "no"})`,
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

    const projectId = streamName;
    let cachedProject: Eventsourcing.Project | undefined;
    if (isRebuild) {
      logger.debug(
        { projectId, cursor, cursorToLastItem, nItems: newItems.length },
        `Rebuilding cache for project ${projectId}`,
      );
    } else {
      cachedProject = cache.projects.get(projectId);
    }

    const updatedProject = await Eventsourcing.applyStreamItems(newItems, cachedProject);
    if (updatedProject !== undefined) {
      cache.projects.set(projectId, updatedProject);
    }

    if (cursorToLastItem !== undefined) {
      cache.streamState.set(streamName, cursorToLastItem);
    }

    if (isRebuild) {
      ++nRebuiltProjects;
    } else {
      ++nUpdatedProjects;
    }
  }

  if (logger.levelVal >= logger.levels.values.debug) {
    // Returns [seconds, nanoseconds]:
    const hrtimeDiff = process.hrtime(startTime);
    const elapsedMilliseconds = (hrtimeDiff[0] * 1e9 + hrtimeDiff[1]) / 1e6;
    logger.debug(
      cache.streamState,
      `Stream cache updated in ${elapsedMilliseconds} ms: ${
        projectStreams.length
      } projects (${nUpdatedProjects} updated, ${nRebuiltProjects} rebuilt)`,
    );
  }
}
