import { VError } from "verror";
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
): Promise<Result.Type<ResourceMap>> {
  const newEventResult = await Cache.withCache(conn, ctx, (cache) => {
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

  if (Result.isErr(newEventResult)) {
    return new VError(newEventResult, `create workflowitem failed`);
  }
  const newEvents = newEventResult;

  let workflowitemEvent;
  for (const event of newEvents) {
    await store(conn, ctx, event);
    if (isCreateEvent(event)) {
      workflowitemEvent = event;
    }
  }

  const resourceIds: ResourceMap = {
    project: { id: workflowitemEvent.projectId },
    subproject: { id: workflowitemEvent.subprojectId },
    workflowitem: { id: workflowitemEvent.workflowitem.id },
  };

  return resourceIds;
}

function isCreateEvent(businessEvent: BusinessEvent): businessEvent is WorkflowitemCreated.Event {
  return businessEvent.type === "workflowitem_created";
}
