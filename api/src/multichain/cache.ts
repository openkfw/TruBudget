import Intent from "../authz/intents";
import deepcopy from "../lib/deepcopy";
import logger from "../lib/logger";
import { MultichainClient, Stream } from "./Client.h";
import { ConnToken } from "./conn";
import * as Eventsourcing from "./eventsourcing";
import * as ProjectEvents from "./ProjectEvents";
import { Item } from "./responses/liststreamitems";

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
  // lastblock?: {
  //   height: number;
  //   hash: string;
  // };
  streamState: Map<StreamName, StreamCursor>;
  // Cached project streams, to be invalidated regularly and after project.create:
  projectStreams?: Stream[];
  // The cached content:
  projects: Map<string, Eventsourcing.Project>;
};

export function initCache(): Cache {
  return {
    isWriteLocked: false,
    // lastblock: undefined,
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
    amount: x.amount,
    currency: x.currency,
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

// /**
//  * Clients expect reads to reflect all previous writes, but MultiChain's block-related
//  * API does not directly support this. Instead, new transactions are first written to
//  * the "mempool" (and can subsequently be extracted using `getrawtransaction`). Instead
//  * of accessing this pool directly, we instead wait for MultiChain to complete
//  * processing those pending transactions. This is not only easier from an implementation
//  * perspective, but it also guarantees that the changes are agreed upon in the network
//  * (i.e. "mined").
//  */
// async function waitForPendingTransactions(conn: ConnToken) {
//   while (true) {
//     // TODO remove
//     logger.error("XXXXXXXXXX");
//     const pendingTransactions = await conn.multichainClient.getRpcClient().invoke("getrawmempool");
//     // TODO debug
//     logger.error(
//       `Cache: waiting for ${pendingTransactions.length} pending MultiChain transactions`,
//     );
//     if (pendingTransactions.length === 0) {
//       break;
//     }
//     await new Promise(res => setTimeout(res, 2000));
//   }
// }

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

  // Returns [seconds, nanoseconds]:
  const hrtimeDiff = process.hrtime(startTime);
  const elapsedMilliseconds = (hrtimeDiff[0] * 1e9 + hrtimeDiff[1]) / 1e6;
  logger.info(
    cache.streamState,
    `Project cache updated in ${elapsedMilliseconds} ms: total=${
      projectStreams.length
    }, updated=${nUpdatedProjects}, rebuilt:${nRebuiltProjects}`,
  );
}

// async function updateCacheFromBlocks(conn: ConnToken): Promise<void> {
//   await waitForPendingTransactions(conn);
//
//   /**
//    * height and last txid of mempool -> save
//    * snapshot for active chain: read up to top block
//    * snapshot for mempool: active-chain snapshot + mempool transactions
//    * if block height stays the same apply new mempool transactions
//    *    if known latest tx is no longer in mempool -> re-read top block
//    */
//
//   const { cache } = conn;
//   const lastCachedBlock = cache.lastblock;
//
//   let firstNewBlockNo: number;
//   if (lastCachedBlock === undefined) {
//     firstNewBlockNo = 0;
//   } else {
//     // Verify that the chain hasn't changed:
//     const hashOnChain = await conn.multichainClient
//       .listBlocksByHeight(lastCachedBlock.height, lastCachedBlock.height)
//       .then(list => (list.length ? list[0].hash : undefined));
//     if (hashOnChain === undefined || lastCachedBlock.hash !== hashOnChain) {
//       logger.info({ lastCachedBlock, hashOnChain }, `Cache out-of-sync, rebuilding..`);
//       firstNewBlockNo = 0;
//     } else {
//       // last known block = last actual block => we continue with the next block:
//       firstNewBlockNo = lastCachedBlock.height + 1;
//     }
//   }
//
//   const lastBlockOnChain = await conn.multichainClient.getLastBlockInfo();
//   // TODO remove
//   logger.error(
//     await conn.multichainClient.getRpcClient().invoke("getlastblockinfo"),
//     "getlastblockinfo",
//   );
//   logger.error(
//     await conn.multichainClient.getRpcClient().invoke("getblockchaininfo"),
//     "getblockchaininfo",
//   );
//   logger.error(
//     await conn.multichainClient.getRpcClient().invoke("listblocks", "-1"),
//     "listblocks -1",
//   );
//   logger.error(
//     await conn.multichainClient.getRpcClient().invoke("getmempoolinfo"),
//     "getmempoolinfo",
//   );
//   const mempool = await conn.multichainClient.getRpcClient().invoke("getrawmempool");
//   for (const txid of mempool) {
//     logger.error(
//       await conn.multichainClient.getRpcClient().invoke("getrawtransaction", txid, "1"),
//       "getrawmempool/getrawtransaction",
//     );
//   }
//
//   if (lastCachedBlock !== undefined && lastCachedBlock.height === lastBlockOnChain.height) {
//     // TODO debug
//     logger.warn(`Cache up-to-date (block #${lastCachedBlock.height}: ${lastCachedBlock.hash})`);
//     return;
//   }
//
//   if (lastCachedBlock !== undefined && lastCachedBlock.height > lastBlockOnChain.height) {
//     logger.info(
//       `Chain block height ${lastCachedBlock.height} < cache block height ${
//         lastBlockOnChain.height
//       } => rebuilding cache..`,
//     );
//     firstNewBlockNo = 0;
//   }
//
//   let loggedAction: string;
//   if (firstNewBlockNo === 0) {
//     if (lastCachedBlock === undefined) {
//       loggedAction = "Initializing";
//     } else {
//       loggedAction = "Clearing and rebuilding";
//       cache.projects.clear();
//     }
//   } else {
//     loggedAction = "Updating";
//   }
//   // TODO debug
//   logger.warn(`${loggedAction} cache with blocks [${firstNewBlockNo}, ${lastBlockOnChain.height}]`);
//
//   const streams = await conn.multichainClient.streams();
//   const projectStreams = streams.filter(x => x.details.kind === "project").map(x => x.name);
//   // TODO remove
//   logger.warn(streams, "streams");
//   for (const stream of projectStreams) {
//     const newStreamItems = await conn.multichainClient.listStreamBlockItemsByHeight(
//       stream,
//       lastBlockOnChain.height,
//       firstNewBlockNo,
//     );
//     // TODO remove
//     logger.warn(newStreamItems, `new items for stream ${stream}`);
//     const projectId = stream;
//     const project = await Eventsourcing.applyStreamItems(
//       newStreamItems,
//       cache.projects.get(projectId),
//     );
//     if (project !== undefined) {
//       cache.projects.set(projectId, project);
//     }
//   }
//
//   cache.lastblock = {
//     height: lastBlockOnChain.height,
//     hash: lastBlockOnChain.hash,
//   };
//
//   // TODO debug
//   logger.warn(cache.lastblock, `Cache updated`);
// }
