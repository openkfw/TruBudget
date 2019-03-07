import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as ProjectAssigned from "./project_assigned";
import { sourceProjects } from "./project_eventsourcing";

interface Repository {
  getProjectEvents(): Promise<BusinessEvent[]>;
}

export async function assignProject(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  assignee: Identity,
  repository: Repository,
): Promise<{ newEvents: BusinessEvent[]; errors: Error[] }> {
  const projectEvents = await repository.getProjectEvents();
  const { projects } = sourceProjects(ctx, projectEvents);

  const project = projects.find(x => x.id === projectId);
  if (project === undefined) {
    return { newEvents: [], errors: [new NotFound(ctx, "project", projectId)] };
  }

  // Create the new event:
  const projectAssigned = ProjectAssigned.createEvent(ctx.source, issuer.id, projectId, assignee);

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    if (!Project.permits(project, issuer, ["project.assign"])) {
      return {
        newEvents: [],
        errors: [new NotAuthorized(ctx, issuer.id, projectAssigned)],
      };
    }
  }

  // Check that the new event is indeed valid:
  const { errors } = sourceProjects(ctx, projectEvents.concat([projectAssigned]));
  if (errors.length > 0) {
    return { newEvents: [], errors: [new InvalidCommand(ctx, projectAssigned, errors)] };
  }

  return { newEvents: [projectAssigned], errors: [] };
}
