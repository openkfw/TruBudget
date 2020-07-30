import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { ResourceMap } from "./domain/ResourceMap";
import * as Subproject from "./domain/workflow/subproject_create";
import { store } from "./store";

export { RequestData } from "./domain/workflow/subproject_create";

export async function createSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: Subproject.RequestData,
): Promise<Result.Type<ResourceMap>> {
  const createEventResult = await Cache.withCache(conn, ctx, (cache) => {
    return Subproject.createSubproject(ctx, serviceUser, requestData, {
      subprojectExists: async (projectId, subprojectId) => {
        const subproject = cache.getSubproject(projectId, subprojectId);
        return Result.isOk(subproject);
      },
      projectPermissions: async (projectId) => {
        return cache
          .getProject(projectId)
          .then((result) => Result.map(result, (p) => p.permissions));
      },
    });
  });

  if (Result.isErr(createEventResult)) {
    return new VError(createEventResult, `close project failed`);
  }
  const createEvent = createEventResult;

  await store(conn, ctx, createEvent);

  const resourceIds: ResourceMap = {
    project: { id: createEvent.projectId },
    subproject: { id: createEvent.subproject.id },
  };
  return resourceIds;
}
