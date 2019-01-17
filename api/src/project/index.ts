import { isProjectAssignable, isProjectVisibleTo, Project } from "./Project";
import { User } from "./User";

export interface ProjectAPI {
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
    singleProjectReader: SingleProjectReader,
    projectAssigner: ProjectAssigner,
    notifier: ProjectNotifier,
    assigner: User,
    projectId: string,
    assignee: string,
  ): Promise<void>;
}

export interface SingleProjectReader {
  /**
   * Fetch a single project.
   *
   * @param id Project ID.
   */
  getProject(id: string): Promise<Project>;
}

export interface AllProjectsReader {
  /**
   * Fetch all projects.
   */
  getProjectList(): Promise<Project[]>;
}

export interface ProjectAssigner {
  /**
   *
   * @param project ID of the affected project.
   * @param assignee The identity (user ID or group ID) to be assigned to the project.
   */
  assignProject(projectId: string, assignee: string): Promise<void>;
}

export interface ProjectNotifier {
  projectAssigned(assigner: string, project: Project, assignee: string): Promise<void>;
}

export class ProjectService implements ProjectAPI {
  public async getProjectList(projectLister: AllProjectsReader, user: User): Promise<Project[]> {
    const allProjects = await projectLister.getProjectList();
    const authorizedProjects = allProjects.filter(project => isProjectVisibleTo(project, user));
    return authorizedProjects;
  }

  public async assignProject(
    singleProjectReader: SingleProjectReader,
    assigner: ProjectAssigner,
    notifier: ProjectNotifier,
    user: User,
    projectId: string,
    assignee: string,
  ): Promise<void> {
    const project = await singleProjectReader.getProject(projectId);
    if (!isProjectAssignable(project, user, assignee)) {
      throw new Error(
        `Identity ${user.id} is not allowed to re-assign project ${projectId} to ${assignee}.`,
      );
    }
    await assigner.assignProject(projectId, assignee);
    await notifier.projectAssigned(user.id, project, assignee);
  }
}
