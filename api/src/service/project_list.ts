import { Ctx } from "../lib/ctx";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectList from "./domain/workflow/project_list";

export async function listProjects(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Project.Project[]> {
  const visibleProjects = await ProjectList.getAllVisible(ctx, serviceUser, {
    getAllProjectEvents: async () => {
      // Refresh the cache first:
      await Cache2.refresh(conn);
      // We use the events instead of the aggregate:
      const allEvents: BusinessEvent[] = [];
      for (const projectEvents of conn.cache2.eventsByStream.values()) {
        allEvents.push(...projectEvents);
      }
      return allEvents;
    },
  });
  return visibleProjects;
}
