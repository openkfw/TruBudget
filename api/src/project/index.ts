import { isProjectAssignable, Project } from "./Project";
import { User } from "./User";

export * from "./Project";
export * from "./User";

export type Reader = (id: string) => Promise<Project>;

export type Assigner = (projectId: string, assignee: string) => Promise<void>;

export type AssignmentNotifier = (project: Project, actingUser: string) => Promise<void>;

/**
 *
 * @param actingUser The requesting user.
 * @param projectId ID of the affected project.
 * @param assignee The identity (user ID or group ID) to be assigned to the project.
 */
export async function assign(
  actingUser: User,
  projectId: string,
  assignee: string,
  {
    getProject,
    saveProjectAssignment,
    notify,
  }: {
    getProject: Reader;
    saveProjectAssignment: Assigner;
    notify: AssignmentNotifier;
  },
): Promise<void> {
  const project = await getProject(projectId);
  if (!isProjectAssignable(project, actingUser)) {
    return Promise.reject(
      Error(
        `Identity ${
          actingUser.id
        } is not allowed to re-assign project ${projectId} to ${assignee}.`,
      ),
    );
  }
  await saveProjectAssignment(projectId, assignee);
  const updatedProject = await getProject(projectId);
  await notify(updatedProject, actingUser.id);
}
