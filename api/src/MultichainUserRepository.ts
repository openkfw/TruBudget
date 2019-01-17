import { AuthToken } from "./authz/token";
import { WriterFactory } from "./httpd";
import { MultichainRepository } from "./MultichainRepository";
import { Issuer } from "./MultichainRepository/Issuer";
import { ProjectAssigner } from "./project";

export class MultichainUserRepository implements WriterFactory {
  constructor(private readonly repo: MultichainRepository) {}

  public projectAssigner(token: AuthToken): ProjectAssigner {
    const repo = this.repo;
    const issuer: Issuer = { name: token.userId, address: token.address };
    const assigner: ProjectAssigner = {
      assignProject(project: string, assignee: string): Promise<void> {
        return repo.assignProject(issuer, project, assignee);
      },
    };
    return assigner;
  }
}
