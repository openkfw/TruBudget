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
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemUpdated from "./workflowitem_updated";

export type RequestData = WorkflowitemUpdated.Modification;
export const requestDataSchema = WorkflowitemUpdated.modificationSchema;

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getWorkflowitem(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
    workflowitemId: Workflowitem.Id,
  ): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
}

export async function updateWorkflowitem(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; workflowitem: Workflowitem.Workflowitem }>> {
  const workflowitem = await repository.getWorkflowitem(projectId, subprojectId, workflowitemId);

  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  const newEvent = WorkflowitemUpdated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
    data,
  );

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    if (!Workflowitem.permits(workflowitem, issuer, ["project.update"])) {
      return new NotAuthorized(ctx, issuer.id, newEvent);
    }
  }

  // Check that the new event is indeed valid:

  const result = WorkflowitemUpdated.apply(ctx, newEvent, workflowitem);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, newEvent, [result]);
  }

  // Create notification events:
  let notifications: NotificationCreated.Event[] = [];
  if (workflowitem.assignee !== undefined && workflowitem.assignee !== issuer.id) {
    const recipients = await repository.getUsersForIdentity(workflowitem.assignee);
    notifications = recipients.map(recipient =>
      NotificationCreated.createEvent(ctx.source, issuer.id, recipient, newEvent, projectId),
    );
  }

  return { newEvents: [newEvent, ...notifications], workflowitem };
}
