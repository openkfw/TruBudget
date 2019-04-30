import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { ProjectTraceEvent } from "./domain/workflow/project_trace_event";
import * as ProjectGet from "./project_get";

export async function getTraceEvents(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: string,
): Promise<ProjectTraceEvent[]> {
  const project = await ProjectGet.getProject(conn, ctx, serviceUser, projectId);
  if (Result.isErr(project)) throw project;
  return project.log;
}
