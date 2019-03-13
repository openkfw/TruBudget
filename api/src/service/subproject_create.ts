import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { Id } from "./domain/workflow/subproject";
import * as Subproject from "./domain/workflow/subproject_create";
import * as SubprojectCreated from "./domain/workflow/subproject_created";
import { loadProjectEvents } from "./load";

export { RequestData } from "./domain/workflow/subproject_create";

export async function createSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: Subproject.RequestData,
): Promise<Id> {
  const { newEvents, errors } = await Subproject.createSubproject(ctx, serviceUser, requestData, {
    getProjectEvents: async projectId => loadProjectEvents(conn, projectId),
  });
  if (errors) return Promise.reject(errors);
  if (!newEvents.length) {
    const msg = "failed to create subproject";
    logger.error({ ctx, serviceUser, requestData }, msg);
    throw new Error(msg);
  }

  const subprojectEvent = newEvents.find(x => (x as any).subprojectId !== undefined);
  if (subprojectEvent === undefined) throw Error(`Assertion: This is a bug.`);
  const subprojectId = (subprojectEvent as SubprojectCreated.Event).subproject.id;
  return subprojectId;
}
