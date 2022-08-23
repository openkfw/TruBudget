import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache/index";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { ResourceMap } from "./domain/ResourceMap";
import * as ProjectCreate from "./domain/workflow/project_create";
import { getGlobalPermissions } from "./global_permissions_get";
import { store } from "./store";

export { RequestData } from "./domain/workflow/project_create";

export async function createProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: ProjectCreate.RequestData,
): Promise<Result.Type<ResourceMap>> {
  logger.debug({ req: requestData }, "Creating project");

  const creationEventResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectCreate.createProject(ctx, serviceUser, requestData, {
      getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
      projectExists: async (projectId) => {
        return Result.isOk(await cache.getProject(projectId));
      },
    }),
  );

  if (Result.isErr(creationEventResult)) {
    return new VError(creationEventResult, "create project failed");
  }
  const creationEvent = creationEventResult;

  await store(conn, ctx, creationEvent, serviceUser.address);

  const resourceIds: ResourceMap = {
    project: { id: creationEvent.project.id },
  };
  return resourceIds;
}
