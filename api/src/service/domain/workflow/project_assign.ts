import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as NotificationCreated from "./notification_created";
import * as Project from "./project";
import * as ProjectAssigned from "./project_assigned";
import * as ProjectEventSourcing from "./project_eventsourcing";

interface Repository {
  getProject(): Promise<Result.Type<Project.Project>>;
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
}

export async function assignProject(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  assignee: Identity,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; project: Project.Project }>> {
  let project = await repository.getProject();
  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  if (project.assignee === assignee) {
    // This is already assigned to that user.
    return { newEvents: [], project };
  }

  // Create the new event:
  const projectAssigned = ProjectAssigned.createEvent(ctx.source, issuer.id, projectId, assignee);
  if (Result.isErr(projectAssigned)) {
    return new VError(projectAssigned, "failed to create event");
  }

  // Check authorization (if not root):
  const intent = "project.assign";
  if (issuer.id !== "root" && !Project.permits(project, issuer, [intent])) {
    return new NotAuthorized({ ctx, userId: issuer.id, intent, target: project });
  }

  // Check that the new event is indeed valid:
  const result = ProjectEventSourcing.newProjectFromEvent(ctx, project, projectAssigned);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, projectAssigned, [result]);
  }
  project = result;

  // Create notification events:
  const recipients = await repository.getUsersForIdentity(assignee);
  const notifications = recipients
    // The issuer doesn't receive a notification:
    .filter(userId => userId !== issuer.id)
    .map(recipient =>
      NotificationCreated.createEvent(ctx.source, issuer.id, recipient, projectAssigned, projectId),
    );

  return { newEvents: [projectAssigned, ...notifications], project };
}
