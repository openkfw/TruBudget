import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectGet from "./domain/workflow/project_get";
import { loadProjectEvents } from "./load";

export async function getProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<Project.Project>> {
  const projectResult = await ProjectGet.getProject(ctx, serviceUser, projectId, {
    getProjectEvents: async () => loadProjectEvents(conn, projectId),
  });
  return Result.mapErr(
    projectResult,
    err => new VError(err, `could not read project ${projectId} from chain`),
  );
}
