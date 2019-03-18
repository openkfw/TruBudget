import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Id } from "./domain/workflow/subproject";
import * as Subproject from "./domain/workflow/subproject_create";
import * as SubprojectCreated from "./domain/workflow/subproject_created";

export { RequestData } from "./domain/workflow/subproject_create";

export async function createSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: Subproject.RequestData,
): Promise<Id> {
  const { newEvents, errors } = await Cache.withCache(conn, ctx, cache => {
    return Subproject.createSubproject(ctx, serviceUser, requestData, {
      subprojectExists: async (projectId, subprojectId) => {
        return cache.getSubprojectEvents(projectId, subprojectId).length > 0;
      },
      projectPermissions: async projectId => {
        return cache.getProject(projectId).then(result => Result.map(result, p => p.permissions));
      },
    });
  });
  if (errors) return Promise.reject(errors);
  if (!newEvents.length) {
    const msg = "failed to create subproject";
    logger.error({ ctx, serviceUser, requestData }, msg);
    throw new Error(msg);
  }

  const subprojectEvent = newEvents.find(x => (x as any).subprojectId !== undefined);
  if (subprojectEvent === undefined) throw Error(`Assertion: This is a bug.`);
  return (subprojectEvent as SubprojectCreated.Event).subproject.id;
}
