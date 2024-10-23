import { Ctx } from "../lib/ctx";
import * as Result from "../result";

import * as SnapshotService from "./cache_snapshot";
import { ConnToken } from "./conn";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import { Item } from "./liststreamitems";

const MAX_ITEM_COUNT = 0x7fffffff;

export async function getWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  projectId: Project.Id,
  workflowitemId: Workflowitem.Id,
): Promise<Result.Type<Workflowitem.Workflowitem>> {
  return await SnapshotService.getLatestSnapshot(
    ctx,
    conn,
    projectId,
    workflowitemId,
    "workflowitem_snapshot_published",
  );
}

export async function getAllWorkflowitems(
  conn: ConnToken,
  ctx: Ctx,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
): Promise<Workflowitem.Workflowitem[]> {
  const rpcClient = conn.multichainClient.getRpcClient();
  let items: Item[] = [];
  items = await rpcClient.invoke(
    "liststreamkeyitems",
    projectId,
    subprojectId + "_workflows",
    false,
    MAX_ITEM_COUNT,
  );

  const wfiPromises = items.reduce((acc, currentItem, next) => {
    if (currentItem.data.json.type === "workflowitem_created") {
      acc.push(getWorkflowitem(conn, ctx, projectId, currentItem.data.json.workflowitem.id));
    }
    return acc;
  }, [] as Promise<Result.Type<Workflowitem.Workflowitem>>[]);
  console.log("omg", wfiPromises);

  const results = await Promise.all(wfiPromises);
  console.log("pepega", results);

  return results.reduce((acc, currentResult, next) => {
    const result = currentResult;
    if (Result.isOk(result)) {
      acc.push(result);
    }
    return acc;
  }, [] as Workflowitem.Workflowitem[]);
}
