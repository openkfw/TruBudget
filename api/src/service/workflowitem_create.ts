import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Id } from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem_create";
import * as WorkflowitemCreated from "./domain/workflow/workflowitem_created";
import { store } from "./store";

export { RequestData } from "./domain/workflow/workflowitem_create";

export async function createWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: Workflowitem.RequestData,
): Promise<Map<Id, string>> {
  const result = await Cache.withCache(conn, ctx, cache => {
    return Workflowitem.createWorkflowitem(ctx, serviceUser, requestData, {
      workflowitemExists: async (projectId: string, subprojectId: string, workflowitemId: string) =>
        cache.getWorkflowitemEvents(projectId, subprojectId, workflowitemId).length > 0,
      getSubproject: async (projectId: string, subprojectId: string) =>
        cache.getSubproject(projectId, subprojectId),
    });
  });

  if (Result.isErr(result)) throw result;
  const { newEvents } = result;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  const workflowitemEvent = newEvents.find(x => (x as any).workflowitem.id !== undefined);
  if (workflowitemEvent === undefined) throw Error(`Assertion: This is a bug.`);

  return new Map()
    .set("projectId", (workflowitemEvent as WorkflowitemCreated.Event).projectId)
    .set("subprojectId", (workflowitemEvent as WorkflowitemCreated.Event).subprojectId)
    .set("workflowitemId", (workflowitemEvent as WorkflowitemCreated.Event).workflowitem.id);
}
