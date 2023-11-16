import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectUpdate from "./domain/workflow/subproject_update";
import * as SubprojectSnapshotPublish from "./domain/workflow/subproject_snapshot_publish";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import { store } from "./store";

export async function updateSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  requestData: SubprojectUpdate.RequestData,
): Promise<Result.Type<void>> {
  logger.debug({ req: requestData }, "Updating subproject");

  const newEventsResult = await SubprojectUpdate.updateSubproject(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    requestData,
    {
      getSubproject: async (pId, spId) => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, pId, spId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    },
  );

  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, "update subproject failed");
  }
  const newEvents = newEventsResult;

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
