import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { ResourceMap } from "./domain/ResourceMap";
import * as ProjectCreate from "./domain/workflow/project_create";
import * as ProjectCreated from "./domain/workflow/project_created";
import { getGlobalPermissions } from "./global_permissions_get";
import { store } from "./store";

export { RequestData } from "./domain/workflow/project_create";

export async function createProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: ProjectCreate.RequestData,
): Promise<ResourceMap> {
  const { newEvents, errors } = await Cache.withCache(conn, ctx, async cache =>
    ProjectCreate.createProject(ctx, serviceUser, requestData, {
      getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
      projectExists: async projectId => {
        return Result.isOk(await cache.getProject(projectId));
      },
    }),
  );
  if (errors.length > 0) return Promise.reject(errors);
  if (!newEvents.length) {
    const msg = "failed to create project";
    logger.error({ ctx, serviceUser, requestData }, msg);
    throw new Error(msg);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  const creationEvent = newEvents.find(x => x.type === "project_created") as ProjectCreated.Event;
  if (creationEvent === undefined) throw Error(`Assertion: This is a bug.`);
  const resourceIds: ResourceMap = {
    project: { id: creationEvent.project.id },
  };
  return resourceIds;
}
