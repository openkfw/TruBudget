import { isProjectVisibleTo, Project } from "./Project";
import { User } from "./User";

export interface ProjectAPI {
  projectList(user: User): Promise<Project[]>;
}

export interface ProjectReader {
  projectList(): Promise<Project[]>;
}

export class ProjectService implements ProjectAPI {
  constructor(private readonly reader: ProjectReader) {}

  public async projectList(user: User): Promise<Project[]> {
    const allProjects = await this.reader.projectList();
    const authorizedProjects = allProjects.filter(project => isProjectVisibleTo(project, user));
    return authorizedProjects;
  }
}
