import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { ResourceMap } from "./domain/ResourceMap";
import * as Subproject from "./domain/workflow/subproject_create";
import * as SubprojectCreated from "./domain/workflow/subproject_created";
import { store } from "./store";

export { RequestData } from "./domain/workflow/subproject_create";

export async function createSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: Subproject.RequestData,
): Promise<ResourceMap> {
  const result = await Cache.withCache(conn, ctx, cache => {
    return Subproject.createSubproject(ctx, serviceUser, requestData, {
      subprojectExists: async (projectId, subprojectId) => {
        const subproject = cache.getSubproject(projectId, subprojectId);
        return Result.isOk(subproject);
      },
      projectPermissions: async projectId => {
        return cache.getProject(projectId).then(result => Result.map(result, p => p.permissions));
      },
    });
  });

  if (Result.isErr(result)) return Promise.reject(result);

  // TODO: Do we still need this, since we are already checking the result
  if (!result.newEvents.length) {
    const msg = "failed to create subproject";
    logger.error({ ctx, serviceUser, requestData }, msg);
    throw new Error(msg);
  }

  for (const event of result.newEvents) {
    await store(conn, ctx, event);
  }

  const subprojectEvent = result.newEvents.find(x => (x as any).subproject.id !== undefined);
  if (subprojectEvent === undefined) {
    throw Error(
      `Assertion: This is a bug. Created subproject but couldn't find its creation Event`,
    );
  }
  const resourceIds: ResourceMap = {
    project: { id: (subprojectEvent as SubprojectCreated.Event).projectId },
    subproject: { id: (subprojectEvent as SubprojectCreated.Event).subproject.id },
  };
  return resourceIds;
}
