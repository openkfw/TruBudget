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
import * as WorkflowitemAssigned from "./workflowitem_assigned";

interface Repository {
  getWorkflowitem(workflowitemId: string): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
}

export async function assignWorkflowitem(
  ctx: Ctx,
  publisher: ServiceUser,
  assignee: UserRecord.Id,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; workflowitem: Workflowitem.Workflowitem }>> {
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return new VError(
      new NotFound(ctx, "workflowitem", workflowitemId),
      `Couldn't assign ${assignee} to workflowitem ${workflowitemId}. Workflowitem not found!`,
    );
  }

  // Dont re-assign to the same user:
  if (assignee === workflowitem.assignee) {
    return { newEvents: [], workflowitem };
  }

  const assignEvent = WorkflowitemAssigned.createEvent(
    ctx.source,
    publisher.id,
    projectId,
    subprojectId,
    workflowitemId,
    assignee,
  );
  if (Result.isErr(assignEvent)) {
    return new VError(assignEvent, "failed to create event");
  }

  // Check authorization:
  if (
    publisher.id !== "root" &&
    !Workflowitem.permits(workflowitem, publisher, ["workflowitem.assign"])
  ) {
    return new NotAuthorized(ctx, publisher.id, assignEvent);
  }

  // Check that the new event is indeed valid:
  const result = WorkflowitemAssigned.apply(ctx, assignEvent, workflowitem);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, assignEvent, [result]);
  }

  // Create notification events:
  const recipients = workflowitem.assignee
    ? await repository.getUsersForIdentity(workflowitem.assignee)
    : [];
  const notifications = recipients
    // The publisher doesn't receive a notification:
    .filter(userId => userId !== publisher.id)
    .map(recipient =>
      NotificationCreated.createEvent(
        ctx.source,
        publisher.id,
        recipient,
        assignEvent,
        projectId,
        subprojectId,
        workflowitemId,
      ),
    );

  return { newEvents: [assignEvent, ...notifications], workflowitem };
}
