import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Permissions } from "./domain/permissions";
import * as Project from "./domain/workflow/project";
import * as ProjectGet from "./domain/workflow/project_get";

export async function getProjectPermissions(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<Permissions>> {
  const projectResult = await ProjectGet.getProject(ctx, serviceUser, projectId, {
    getProjectEvents: async () => {
      await Cache2.refresh(conn, projectId);
      return conn.cache2.eventsByStream.get(projectId) || [];
    },
  });

  if (Result.isErr(projectResult)) {
    projectResult.message = `could not fetch project permissions: ${projectResult.message}`;
    return projectResult;
  }

  return projectResult.permissions;
}
