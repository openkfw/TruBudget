import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectClose from "./domain/workflow/subproject_close";
import * as SubprojectSnapshotPublish from "./domain/workflow/subproject_snapshot_publish";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";
import { store } from "./store";

export async function closeSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
): Promise<Result.Type<void>> {
  logger.debug({ projectId, subprojectId }, "Closing Subproject");

  const closeSubprojectResult = await SubprojectClose.closeSubproject(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    {
      getSubproject: async (pId, spId) => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, pId, spId);
      },
      getWorkflowitems: async (pId, spId) => {
        return await WorkflowitemCacheHelper.getAllWorkflowitems(conn, ctx, pId, spId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    },
  );

  if (Result.isErr(closeSubprojectResult)) {
    return new VError(closeSubprojectResult, "close subproject failed");
  }
  const { newEvents } = closeSubprojectResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  const { canPublish, eventData } = await SubprojectSnapshotPublish.publishSubprojectSnapshot(
    ctx,
    conn,
    projectId,
    subprojectId,
    serviceUser,
  );
  if (canPublish) {
    if (Result.isErr(eventData)) {
      return new VError(eventData, "create subproject snapshot failed");
    }
    const publishEvent = eventData;
    await store(conn, ctx, publishEvent, serviceUser.address);
  }
}
