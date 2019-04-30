import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { WorkflowitemTraceEvent } from "./domain/workflow/workflowitem_trace_event";
import * as WorkflowitemGet from "./workflowitem_get";

export async function getTraceEvents(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: string,
  subprojectId: string,
  workflowitemId: string,
): Promise<WorkflowitemTraceEvent[]> {
  const workflowitem = await WorkflowitemGet.getWorkflowitem(
    conn,
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    workflowitemId,
  );
  if (Result.isErr(workflowitem)) throw workflowitem;

  return workflowitem.log;
}
