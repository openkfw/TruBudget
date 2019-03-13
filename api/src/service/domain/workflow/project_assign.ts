import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as NotificationCreated from "./notification_created";
import * as Project from "./project";
import * as ProjectAssigned from "./project_assigned";
import { sourceProjects } from "./project_eventsourcing";

interface Repository {
  getProjectEvents(): Promise<BusinessEvent[]>;
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
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

  if (project.assignee === assignee) {
    // The project is already assigned to that user.
    return { newEvents: [], errors: [] };
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

  // Create notification events:
  const recipients = await repository.getUsersForIdentity(assignee);
  const notifications = recipients.map(recipient =>
    NotificationCreated.createEvent(ctx.source, issuer.id, recipient, projectAssigned, projectId),
  );

  return { newEvents: [projectAssigned, ...notifications], errors: [] };
}
