import Joi = require("joi");

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
import * as ProjectUpdated from "./project_updated";

export interface RequestData {
  displayName?: string;
  description?: string;
  thumbnail?: string;
}

const requestDataSchema = Joi.object({
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  thumbnail: Joi.string().allow(""),
}).or("displayName", "description", "thumbnail");

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getProject(projectId: Project.Id): Promise<Result.Type<Project.Project>>;
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
}

export async function updateProject(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const project = await repository.getProject(projectId);

  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  // Create the new event:
  const projectUpdated = ProjectUpdated.createEvent(ctx.source, issuer.id, projectId, data);

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    if (!Project.permits(project, issuer, ["project.update"])) {
      return new NotAuthorized(ctx, issuer.id, projectUpdated);
    }
  }

  // Check that the new event is indeed valid:

  const result = ProjectUpdated.apply(ctx, projectUpdated, project);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, projectUpdated, [result]);
  }

  // Create notification events:
  let notifications: NotificationCreated.Event[] = [];
  if (project.assignee !== undefined && project.assignee !== issuer.id) {
    const recipients = await repository.getUsersForIdentity(project.assignee);
    notifications = recipients.map(recipient =>
      NotificationCreated.createEvent(ctx.source, issuer.id, recipient, projectUpdated, projectId),
    );
  }

  return { newEvents: [projectUpdated, ...notifications] };
}
