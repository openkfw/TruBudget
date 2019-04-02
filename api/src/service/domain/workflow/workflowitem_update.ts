import { produce } from "immer";
import isEqual = require("lodash.isequal");
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
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemUpdated from "./workflowitem_updated";

export type RequestData = WorkflowitemUpdated.Modification;
export const requestDataSchema = WorkflowitemUpdated.modificationSchema;

interface Repository {
  getWorkflowitem(workflowitemId: Workflowitem.Id): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
}

export async function updateWorkflowitem(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  modification: RequestData,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; workflowitem: Workflowitem.Workflowitem }>> {
  let workflowitem = await repository.getWorkflowitem(workflowitemId);

  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  const newEvent = WorkflowitemUpdated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
    modification,
  );
  if (Result.isErr(newEvent)) {
    return new VError(newEvent, "failed to create event");
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "workflowitem.update";
    if (!Workflowitem.permits(workflowitem, issuer, [intent])) {
      return new NotAuthorized(ctx, issuer.id, intent, workflowitem);
    }
  }

  // Check that the new event is indeed valid:
  const result = produce(workflowitem, draft => WorkflowitemUpdated.apply(ctx, newEvent, draft));

  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, newEvent, [result]);
  }

  // Ignore the update if it doesn't change anything:
  if (isEqual(workflowitem, result)) {
    return { newEvents: [], workflowitem };
  }

  // Create notification events:
  const recipients = workflowitem.assignee
    ? await repository.getUsersForIdentity(workflowitem.assignee)
    : [];
  const notifications = recipients
    // The issuer doesn't receive a notification:
    .filter(userId => userId !== issuer.id)
    .map(recipient =>
      NotificationCreated.createEvent(
        ctx.source,
        issuer.id,
        recipient,
        newEvent,
        projectId,
        subprojectId,
        workflowitemId,
      ),
    );

  return { newEvents: [newEvent, ...notifications], workflowitem: result };
}
