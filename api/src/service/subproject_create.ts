import { Ctx } from "../lib/ctx";
import * as Cache2 from "./cache2";
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
  const { newEvents, errors } = await Subproject.createSubproject(ctx, serviceUser, requestData, {
    getProjectEvents: async projectId => {
      // Refresh the cache first:
      await Cache2.refresh(conn, projectId);
      // We use the events instead of the aggregate:
      return conn.cache2.eventsByStream.get(projectId) || [];
    },
  });
  if (errors) return Promise.reject(errors);
  if (!newEvents.length) {
    return Promise.reject(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  const subprojectEvent = newEvents.find(x => (x as any).subprojectId !== undefined);
  if (subprojectEvent === undefined) throw Error(`Assertion: This is a bug.`);
  const subprojectId = (subprojectEvent as SubprojectCreated.Event).subproject.id;
  return subprojectId;
}
