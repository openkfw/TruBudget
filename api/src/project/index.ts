import { isProjectAssignable, isProjectVisibleTo, Project } from "./Project";
import { User } from "./User";

export * from "./Project";
export * from "./User";

export type ProjectReader = (id: string) => Promise<Project>;

export type AllProjectsReader = () => Promise<Project[]>;

export type ProjectAssigner = (projectId: string, assignee: string) => Promise<void>;

export type AssignedNotifier = (project: Project, assigner: string) => Promise<void>;

// export type UpdatedNotifier = (project: Project, update: Update) => Promise<void>;

export async function getAuthorizedProject(
  getProject: ProjectReader,
  user: User,
  projectId: string,
): Promise<Project> {
  const project = await getProject(projectId);
  if (!isProjectVisibleTo(project, user)) {
    return Promise.reject(Error(`Identity ${user.id} is not allowed to see project ${projectId}.`));
  }
  return project;
}

export async function getAuthorizedProjectList(
  asUser: User,
  { getAllProjects }: { getAllProjects: AllProjectsReader },
): Promise<Project[]> {
  const allProjects = await getAllProjects();
  const authorizedProjects = allProjects.filter(project => isProjectVisibleTo(project, asUser));
  return authorizedProjects;
}

/**
 *
 * @param assigner The requesting user.
 * @param projectId ID of the affected project.
 * @param assignee The identity (user ID or group ID) to be assigned to the project.
 */
export async function assignProject(
  assigner: User,
  projectId: string,
  assignee: string,
  {
    getProject,
    saveProjectAssignment,
    notify,
  }: {
    getProject: ProjectReader;
    saveProjectAssignment: ProjectAssigner;
    notify: AssignedNotifier;
  },
): Promise<void> {
  const project = await getProject(projectId);
  if (!isProjectAssignable(project, assigner, assignee)) {
    return Promise.reject(
      Error(
        `Identity ${assigner.id} is not allowed to re-assign project ${projectId} to ${assignee}.`,
      ),
    );
  }
  await saveProjectAssignment(projectId, assignee);
  const updatedProject = await getProject(projectId);
  await notify(updatedProject, assigner.id);
}
