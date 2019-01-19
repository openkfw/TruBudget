import { isProjectAssignable, isProjectVisibleTo, Project } from "./Project";
import { User } from "./User";

export * from "./Project";
export * from "./User";

export interface API {
  /**
   *
   * @param user The requesting user.
   */
  getProjectList(projectLister: AllProjectsReader, user: User): Promise<Project[]>;

  /**
   *
   * @param assigner The requesting user.
   * @param projectId ID of the affected project.
   * @param assignee The identity (user ID or group ID) to be assigned to the project.
   */
  assignProject(
    singleProjectReader: ProjectReader,
    projectAssigner: ProjectAssigner,
    notifier: AssignedNotifier,
    assigner: User,
    projectId: string,
    assignee: string,
  ): Promise<void>;
}

export type ProjectReader = (id: string) => Promise<Project>;

export type AllProjectsReader = () => Promise<Project[]>;

export type ProjectAssigner = (projectId: string, assignee: string) => Promise<void>;

export type AssignedNotifier = (project: Project, assigner: string) => Promise<void>;

// export type UpdatedNotifier = (project: Project, update: Update) => Promise<void>;

export class ProjectService implements API {
  public async getProjectList(getAllProjects: AllProjectsReader, user: User): Promise<Project[]> {
    const allProjects = await getAllProjects();
    const authorizedProjects = allProjects.filter(project => isProjectVisibleTo(project, user));
    return authorizedProjects;
  }

  public async assignProject(
    getProject: ProjectReader,
    assignProject: ProjectAssigner,
    notify: AssignedNotifier,
    user: User,
    projectId: string,
    assignee: string,
  ): Promise<void> {
    const project = await getProject(projectId);
    if (!isProjectAssignable(project, user, assignee)) {
      throw new Error(
        `Identity ${user.id} is not allowed to re-assign project ${projectId} to ${assignee}.`,
      );
    }
    await assignProject(projectId, assignee);
    await notify(project, user.id);
  }
}
