import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { SubprojectTraceEvent } from "./domain/workflow/subproject_trace_event";
import * as SubprojectGet from "./subproject_get";

export async function getTraceEvents(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: string,
  subprojectId: string,
): Promise<SubprojectTraceEvent[]> {
  const subproject = await SubprojectGet.getSubproject(
    conn,
    ctx,
    serviceUser,
    projectId,
    subprojectId,
  );
  if (Result.isErr(subproject)) throw subproject;

  return subproject.log;
}
