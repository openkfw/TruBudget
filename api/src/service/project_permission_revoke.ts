import { VError } from "verror";

import Intent from "../authz/intents";
import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectPermissionRevoke from "./domain/workflow/project_permission_revoke";
import * as ProjectSnapshotPublish from "./domain/workflow/project_snapshot_publish";
import * as ProjectCacheHelper from "./project_cache_helper";
import { store } from "./store";

export { RequestData } from "./domain/workflow/project_create";

export async function revokeProjectPermission(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  revokee: Identity,
  intent: Intent,
): Promise<Result.Type<void>> {
  logger.debug({ projectId, revokee, intent }, "Revoking project permission");

  const newEventsResult = await ProjectPermissionRevoke.revokeProjectPermission(
    ctx,
    serviceUser,
    projectId,
    revokee,
    intent,
    {
      getProject: async (id) => {
        return await ProjectCacheHelper.getProject(conn, ctx, id);
      },
    },
  );

  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, "revoke project permission failed");
  }

  const newEvents = newEventsResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  const { canPublish, eventData } = await ProjectSnapshotPublish.publishProjectSnapshot(
    ctx,
    conn,
    projectId,
    serviceUser,
  );
  if (canPublish) {
    if (Result.isErr(eventData)) {
      return new VError(eventData, "create project snapshot failed");
    }
    const publishEvent = eventData;
    await store(conn, ctx, publishEvent, serviceUser.address);
  }
}
