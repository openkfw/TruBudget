import Joi = require("joi");
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { isEqual } from "lodash";
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
import * as ProjectEventSourcing from "./project_eventsourcing";
import * as ProjectUpdated from "./project_updated";

export type RequestData = ProjectUpdated.Modification;
export const requestDataSchema = ProjectUpdated.modificationSchema;

export function validate(input): Result.Type<RequestData> {
  const { value, error } = requestDataSchema.validate(input);
  return !error ? value : error;
}

interface Repository {
  getProject(projectId: Project.Id): Promise<Result.Type<Project.Project>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
}

export async function updateProject(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const project = await repository.getProject(projectId);

  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  logger.trace({ issuer, data, projectId }, "Creating project_updated event");
  const projectUpdatedResult = ProjectUpdated.createEvent(ctx.source, issuer.id, projectId, data);
  if (Result.isErr(projectUpdatedResult)) {
    return new VError(projectUpdatedResult, "create update-event failed");
  }
  const projectUpdated = projectUpdatedResult;

  logger.trace({ issuer }, "Checking if user has permissions");
  const intent = "project.update";
  if (!Project.permits(project, issuer, [intent])) {
    return new NotAuthorized({ ctx, userId: issuer.id, intent, target: project });
  }

  logger.trace({ event: projectUpdated }, "Checking event validity");
  const result = ProjectEventSourcing.newProjectFromEvent(ctx, project, projectUpdated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, projectUpdated, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqualIgnoringLog(project, result)) {
    return [];
  }

  logger.trace("Creating notification events");
  let notifications: Result.Type<NotificationCreated.Event[]> = [];
  if (project.assignee !== undefined) {
    const recipientsResult = await repository.getUsersForIdentity(project.assignee);

    if (Result.isErr(recipientsResult)) {
      return new VError(recipientsResult, `fetch users for ${project.assignee} failed`);
    }

    notifications = recipientsResult.reduce((notifications, recipient) => {
      // The issuer doesn't receive a notification:
      if (recipient !== issuer.id) {
        const notification = NotificationCreated.createEvent(
          ctx.source,
          issuer.id,
          recipient,
          projectUpdated,
          projectId,
        );
        if (Result.isErr(notification)) {
          return new VError(notification, "failed to create notification event");
        }
        notifications.push(notification);
      }
      return notifications;
    }, [] as NotificationCreated.Event[]);

    if (Result.isErr(notifications)) {
      return new VError(notifications, "failed to create notification created events");
    }
  }

  return [projectUpdated, ...notifications];
}

function isEqualIgnoringLog(projectA: Project.Project, projectB: Project.Project): boolean {
  const { log: logA, ...a } = projectA;
  const { log: logB, ...b } = projectB;
  return isEqual(a, b);
}
