import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemClose from "./domain/workflow/workflowitem_close";
import * as TypeEvents from "./domain/workflowitem_types/apply_workflowitem_type";
import * as WorkflowitemSnapshotPublish from "./domain/workflow/workflowitem_snapshot_publish";
import { store } from "./store";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";

export async function closeWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  rejectReason?: string,
): Promise<Result.Type<void>> {
  logger.debug({ projectId, subprojectId, workflowitemId, rejectReason }, "Closing workflowitem");

  const newEventsResult = await WorkflowitemClose.closeWorkflowitem(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    workflowitemId,
    {
      getWorkflowitems: async (pId, spId) => {
        return await WorkflowitemCacheHelper.getAllWorkflowitems(conn, ctx, pId, spId);
      },
      getSubproject: async (pId, spId) => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, pId, spId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
      applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
        return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
      },
    },
    rejectReason,
  );

  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, "close workflowitem failed");
  }
  const newEvents = newEventsResult;

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
