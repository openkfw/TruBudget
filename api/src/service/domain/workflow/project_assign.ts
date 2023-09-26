import Intent from "authz/intents";
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
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
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
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

  logger.trace({ issuer, assignee, projectId }, "Creating new project_assign event");
  const projectAssigned = ProjectAssigned.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    assignee,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(projectAssigned)) {
    return new VError(projectAssigned, "failed to create event");
  }

  logger.trace({ issuer }, "Checking if user has permissions");
  const intent: Intent = "project.assign";
  if (issuer.id !== "root" && !Project.permits(project, issuer, [intent])) {
    return new NotAuthorized({ ctx, userId: issuer.id, intent, target: project });
  }

  logger.trace({ event: projectAssigned }, "Checking if project_assigned event is valid");
  const result = ProjectEventSourcing.newProjectFromEvent(ctx, project, projectAssigned);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, projectAssigned, [result]);
  }
  project = result;

  // Create notification events:
  const recipientsResult = await repository.getUsersForIdentity(assignee);
  if (Result.isErr(recipientsResult)) {
    return new VError(recipientsResult, `fetch users for ${assignee} failed`);
  }
  const notifications = recipientsResult.reduce((notifications, recipient) => {
    // The issuer doesn't receive a notification:
    if (recipient === issuer.id) {
      return notifications;
    }

    const notification = NotificationCreated.createEvent(
      ctx.source,
      issuer.id,
      recipient,
      projectAssigned,
      projectId,
      undefined,
      undefined,
      new Date().toISOString(),
      issuer.metadata,
    );
    if (Result.isErr(notification)) {
      return new VError(notification, "failed to create notification event");
    }
    notifications.push(notification);

    return notifications;
  }, [] as NotificationCreated.Event[]);

  if (Result.isErr(notifications)) {
    return new VError(notifications, "failed to create notification events");
  }
  return { newEvents: [projectAssigned, ...notifications], project };
}
