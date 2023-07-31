import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import * as Subproject from "./domain/workflow/subproject";
import * as Project from "./domain/workflow/project";
import * as SnapshotService from "./cache_snapshot";
import { Item } from "./liststreamitems";

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
  items = await rpcClient.invoke("liststreamkeyitems", projectId, "subprojects", false, 0x7fffffff);
  let subprojects: Array<Subproject.Subproject> = [];
  let i;
  for (i = 0; i <= items.length - 1; i++) {
    if (items[i].data.json.type == "subproject_created") {
      const result = await getSubproject(conn, ctx, projectId, items[i].data.json.subproject.id);
      if (Result.isOk(result)) {
        subprojects.push(result);
      }
    }
  }
  return subprojects;
}
