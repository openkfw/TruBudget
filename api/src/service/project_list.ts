import { Ctx } from '../lib/ctx';
import { ConnToken } from './conn';
import { ServiceUser } from './domain/organization/service_user';
import * as Project from './domain/workflow/project';
import * as ProjectList from './domain/workflow/project_list';
import { loadProjectEvents } from './load';

export async function listProjects(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
): Promise<Project.Project[]> {
  const visibleProjects = await ProjectList.getAllVisible(ctx, serviceUser, {
    getAllProjectEvents: async () => loadProjectEvents(conn),
  });
  return visibleProjects;
}
