import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { ServiceUser } from "./domain/organization/service_user";
import { ResourceMap } from "./domain/ResourceMap";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemCreate from "./domain/workflow/workflowitem_create";
import * as WorkflowitemCreated from "./domain/workflow/workflowitem_created";
import * as TypeEvents from "./domain/workflowitem_types/apply_workflowitem_type";
import { store } from "./store";

export { RequestData } from "./domain/workflow/workflowitem_create";

export async function createWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: WorkflowitemCreate.RequestData,
): Promise<ResourceMap> {
  const result = await Cache.withCache(conn, ctx, cache => {
    return WorkflowitemCreate.createWorkflowitem(ctx, serviceUser, requestData, {
      workflowitemExists: async (
        projectId: string,
        subprojectId: string,
        workflowitemId: string,
      ) => {
        const item = await cache.getWorkflowitem(projectId, subprojectId, workflowitemId);
        return Result.isOk(item);
      },
      getSubproject: async (projectId: string, subprojectId: string) =>
        await cache.getSubproject(projectId, subprojectId),
      applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
        return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
      },
    });
  });

  if (Result.isErr(result)) throw result;
  const newEvents = result;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  const workflowitemEvent = newEvents.find(x => (x as any).workflowitem.id !== undefined);
  if (workflowitemEvent === undefined) throw Error(`Assertion: This is a bug.`);

  const resourceIds: ResourceMap = {
    project: { id: (workflowitemEvent as WorkflowitemCreated.Event).projectId },
    subproject: { id: (workflowitemEvent as WorkflowitemCreated.Event).subprojectId },
    workflowitem: { id: (workflowitemEvent as WorkflowitemCreated.Event).workflowitem.id },
  };

  return resourceIds;
}
