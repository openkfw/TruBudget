import Joi = require("joi");
import { isEqual } from "lodash";

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
import * as ProjectEventSourcing from "./project_eventsourcing";
import * as ProjectUpdated from "./project_updated";

export type RequestData = ProjectUpdated.Modification;
export const requestDataSchema = ProjectUpdated.modificationSchema;

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
    const intent = "project.update";
    if (!Project.permits(project, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: project });
    }
  }

  // Check that the new event is indeed valid:
  const result = ProjectEventSourcing.newProjectFromEvent(ctx, project, projectUpdated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, projectUpdated, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqualIgnoringLog(project, result)) {
    return { newEvents: [] };
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

function isEqualIgnoringLog(projectA: Project.Project, projectB: Project.Project): boolean {
  const { log: logA, ...a } = projectA;
  const { log: logB, ...b } = projectB;
  return isEqual(a, b);
}
