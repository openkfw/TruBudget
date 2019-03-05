import { Ctx } from "../lib/ctx";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectList from "./domain/workflow/subproject_list";

export async function listSubprojects(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Subproject.Subproject[]> {
  const visibleSubprojects = await SubprojectList.getAllVisible(ctx, serviceUser, {
    getAllSubprojectEvents: async () => {
      await Cache2.refresh(conn, projectId);
      return conn.cache2.eventsByStream.get(projectId) || [];
    },
  });
  return visibleSubprojects;
}
