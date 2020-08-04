import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemList from "./domain/workflow/workflowitem_list";

export async function listWorkflowitems(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: string,
  subprojectId: string,
): Promise<Result.Type<Workflowitem.ScrubbedWorkflowitem[]>> {
  const workflowitemsResult = await Cache.withCache(conn, ctx, async (cache) =>
    WorkflowitemList.getAllVisible(ctx, serviceUser, projectId, subprojectId, {
      getWorkflowitems: async (pId, spId) => {
        return cache.getWorkflowitems(pId, spId);
      },
      getWorkflowitemOrdering: async (pId, spId) => {
        const subproject = await cache.getSubproject(pId, spId);
        return Result.map(subproject, (x) => x.workflowitemOrdering);
      },
    }),
  );

  return Result.mapErr(
    workflowitemsResult,
    (err) => new VError(err, `could not fetch workflowitems `),
  );
}
