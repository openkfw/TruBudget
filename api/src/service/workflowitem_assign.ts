import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemAssign from "./domain/workflow/workflowitem_assign";
import * as TypeEvents from "./domain/workflowitem_types/apply_workflowitem_type";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export async function assignWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  assignee: Identity,
): Promise<Result.Type<void>> {
  logger.debug(
    { assignee, projectId, subprojectId, workflowitemId },
    "Assigning workflowitem to user",
  );

  const newEventsResult = await Cache.withCache(conn, ctx, async (cache) => {
    return WorkflowitemAssign.assignWorkflowitem(
      ctx,
      serviceUser,
      assignee,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async (id) => {
          return cache.getWorkflowitem(projectId, subprojectId, id);
        },
        getUsersForIdentity: async (identity) => {
          return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
        },
        applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
          return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
        },
      },
    );
  });
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, `assign ${assignee} to workflowitem failed`);
  }
  const newEvents = newEventsResult.newEvents;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }
}
