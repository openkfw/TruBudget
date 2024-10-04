import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { ResourceMap } from "./domain/ResourceMap";
import * as ProjectCreate from "./domain/workflow/project_create";
import * as ProjectSnapshotPublish from "./domain/workflow/project_snapshot_publish";
import { getGlobalPermissions } from "./global_permissions_get";
import * as ProjectCacheHelper from "./project_cache_helper";
import { store } from "./store";

export { RequestData } from "./domain/workflow/project_create";

export async function createProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: ProjectCreate.RequestData,
): Promise<Result.Type<ResourceMap>> {
  logger.debug({ req: requestData }, "Creating project");

  const creationEventResult = await ProjectCreate.createProject(ctx, serviceUser, requestData, {
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
    projectExists: async (projectId) => {
      return Result.isOk(await ProjectCacheHelper.getProject(conn, ctx, projectId));
    },
  });

  if (Result.isErr(creationEventResult)) {
    return new VError(creationEventResult, "create project failed");
  }
  const creationEvent = creationEventResult;

  await store(conn, ctx, creationEvent, serviceUser.address);

  const { eventData } = await ProjectSnapshotPublish.publishProjectSnapshot(
    ctx,
    conn,
    creationEvent.project.id,
    serviceUser,
  );
  if (Result.isErr(eventData)) {
    return new VError(eventData, "create project snapshot failed");
  }
  const publishEvent = eventData;
  await store(conn, ctx, publishEvent, serviceUser.address);

  const resourceIds: ResourceMap = {
    project: { id: creationEvent.project.id },
  };
  return resourceIds;
}
