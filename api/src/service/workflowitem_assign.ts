import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import * as GroupQuery from "./domain/organization/group_query";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemAssign from "./domain/workflow/workflowitem_assign";
import * as WorkflowitemSnapshotPublish from "./domain/workflow/workflowitem_snapshot_publish";
import * as TypeEvents from "./domain/workflowitem_types/apply_workflowitem_type";
import { store } from "./store";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";

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

  const newEventsResult = await WorkflowitemAssign.assignWorkflowitem(
    ctx,
    serviceUser,
    assignee,
    projectId,
    subprojectId,
    workflowitemId,
    {
      getWorkflowitem: async (id) => {
        return await WorkflowitemCacheHelper.getWorkflowitem(conn, ctx, projectId, id);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
      applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
        return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
      },
    },
  );
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, `assign ${assignee} to workflowitem failed`);
  }
  const newEvents = newEventsResult.newEvents;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  const { canPublish, eventData } = await WorkflowitemSnapshotPublish.publishWorkflowitemSnapshot(
    ctx,
    conn,
    projectId,
    workflowitemId,
    serviceUser,
  );
  if (canPublish) {
    if (Result.isErr(eventData)) {
      return new VError(eventData, "create workflowitem snapshot failed");
    }
    const publishEvent = eventData;
    await store(conn, ctx, publishEvent, serviceUser.address);
  }
}
