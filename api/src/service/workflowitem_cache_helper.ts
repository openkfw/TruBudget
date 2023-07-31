import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as Project from "./domain/workflow/project";
import * as SnapshotService from "./cache_snapshot";
import { Item } from "./liststreamitems";

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
    0x7fffffff,
  );
  let workflowitems: Array<Workflowitem.Workflowitem> = [];
  let i;
  for (i = 0; i <= items.length - 1; i++) {
    if (items[i].data.json.type == "workflowitem_created") {
      const result = await getWorkflowitem(
        conn,
        ctx,
        projectId,
        items[i].data.json.workflowitem.id,
      );
      if (Result.isOk(result)) {
        workflowitems.push(result);
      }
    }
  }
  return workflowitems;
}
