import logger from "lib/logger";
import { VError } from "verror";
import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectPermissionGrant from "./domain/workflow/subproject_permission_grant";
import * as SubprojectSnapshotPublish from "./domain/workflow/subproject_snapshot_publish";
import { store } from "./store";
import * as SubprojectCacheHelper from "./subproject_cache_helper";

export { RequestData } from "./domain/workflow/project_create";

export async function grantSubprojectPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  grantee: Identity,
  intent: Intent,
): Promise<Result.Type<void>> {
  logger.debug({ grantee, intent, projectId, subprojectId }, "Granting subproject permission");

  const newEventsResult = await SubprojectPermissionGrant.grantSubprojectPermission(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    grantee,
    intent,
    {
      getSubproject: async (pId, spId) => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, pId, spId);
      },
    },
  );
  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, "close project failed");
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
