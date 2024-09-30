import { Ctx } from "../lib/ctx";
import * as Result from "../result";

import * as SnapshotService from "./cache_snapshot";
import { ConnToken } from "./conn";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import { Item } from "./liststreamitems";

const MAX_ITEM_COUNT = 0x7fffffff;

export async function getSubproject(
  conn: ConnToken,
  ctx: Ctx,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
): Promise<Result.Type<Subproject.Subproject>> {
  return await SnapshotService.getLatestSnapshot(
    ctx,
    conn,
    projectId,
    subprojectId,
    "subproject_snapshot_published",
  );
}

export async function getAllSubprojects(
  conn: ConnToken,
  ctx: Ctx,
  projectId: Project.Id,
): Promise<Subproject.Subproject[]> {
  const rpcClient = conn.multichainClient.getRpcClient();
  let items: Item[] = [];
  items = await rpcClient.invoke(
    "liststreamkeyitems",
    projectId,
    "subprojects",
    false,
    MAX_ITEM_COUNT,
  );

  const subprojectPromises = items.reduce((acc, currentItem, next) => {
    if (currentItem.data.json.type === "subproject_created") {
      acc.push(getSubproject(conn, ctx, projectId, currentItem.data.json.subproject.id));
    }
    return acc;
  }, [] as Promise<Result.Type<Subproject.Subproject>>[]);

  const results = await Promise.all(subprojectPromises);

  return results.reduce((acc, currentResult, next) => {
    const result = currentResult;
    if (Result.isOk(result)) {
      acc.push(result);
    }
    return acc;
  }, [] as Subproject.Subproject[]);
}
