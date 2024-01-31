import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { ResourceMap } from "./domain/ResourceMap";
import * as Subproject from "./domain/workflow/subproject_create";
import * as SubprojectSnapshotPublish from "./domain/workflow/subproject_snapshot_publish";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import * as ProjectCacheHelper from "./project_cache_helper";
import { store } from "./store";

export { RequestData } from "./domain/workflow/subproject_create";

export interface Service {
  createSubproject(
    ctx: Ctx,
    user: ServiceUser,
    createRequest: Subproject.RequestData,
  ): Promise<Result.Type<ResourceMap>>;
}

export async function createSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: Subproject.RequestData,
): Promise<Result.Type<ResourceMap>> {
  logger.debug({ req: requestData }, "Creating Subproject");

  const createEventResult = await Subproject.createSubproject(ctx, serviceUser, requestData, {
    subprojectExists: async (projectId, subprojectId) => {
      const subproject = await SubprojectCacheHelper.getSubproject(
        conn,
        ctx,
        projectId,
        subprojectId,
      );
      return Result.isOk(subproject);
    },
    projectPermissions: async (projectId) => {
      return await ProjectCacheHelper.getProject(conn, ctx, projectId).then((result) =>
        Result.map(result, (p) => p.permissions),
      );
    },
  });

  if (Result.isErr(createEventResult)) {
    return new VError(createEventResult, "create subproject failed");
  }
  const createEvent = createEventResult;

  await store(conn, ctx, createEvent, serviceUser.address);

  const { eventData } = await SubprojectSnapshotPublish.publishSubprojectSnapshot(
    ctx,
    conn,
    createEvent.projectId,
    createEvent.subproject.id,
    serviceUser,
  );
  if (Result.isErr(eventData)) {
    return new VError(eventData, "create subproject snapshot failed");
  }
  const publishEvent = eventData;
  await store(conn, ctx, publishEvent, serviceUser.address);

  const resourceIds: ResourceMap = {
    project: { id: createEvent.projectId },
    subproject: { id: createEvent.subproject.id },
  };
  return resourceIds;
}
