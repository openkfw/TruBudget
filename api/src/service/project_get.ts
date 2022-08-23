import logger from "lib/logger";
import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache/index";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectGet from "./domain/workflow/project_get";

export async function getProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<Project.Project>> {
  logger.debug({ projectId }, "Getting Project");

  const projectResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectGet.getProject(ctx, serviceUser, projectId, {
      getProject: async (pId) => {
        return cache.getProject(pId);
      },
    }),
  );

  return Result.mapErr(
    projectResult,
    (err) => new VError(err, `could not fetch project ${projectId}`),
  );
}
