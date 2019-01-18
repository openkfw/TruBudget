import { AuthToken } from "../authz/token";

export interface ProjectPort {
  assignProject(token: AuthToken, projectId: string, assignee: string): Promise<void>;
}
