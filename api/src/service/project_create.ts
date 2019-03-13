import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectCreate from "./domain/workflow/project_create";
import * as ProjectCreated from "./domain/workflow/project_created";
import { getGlobalPermissions } from "./global_permissions_get";
import { loadProjectEvents } from "./load";
import { store } from "./store";

export { RequestData } from "./domain/workflow/project_create";

export async function createProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: ProjectCreate.RequestData,
): Promise<Project.Id> {
  const { newEvents, errors } = await ProjectCreate.createProject(ctx, serviceUser, requestData, {
    getGlobalPermissions: async () => getGlobalPermissions(conn, ctx, serviceUser),
    projectExists: async projectId => {
      const projectEvents = await loadProjectEvents(conn, projectId);
      return projectEvents.length > 0;
    },
  });
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
  return creationEvent.project.id;
}
