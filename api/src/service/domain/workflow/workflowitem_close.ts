import { VError } from "verror";
import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { canAssumeIdentity } from "../organization/auth_token";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as NotificationCreated from "./notification_created";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import { Id } from "./workflowitem";
import * as WorkflowitemClosed from "./workflowitem_closed";
import { sortWorkflowitems } from "./workflowitem_ordering";

interface Repository {
  getWorkflowitems(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
}

export async function closeWorkflowitem(
  ctx: Ctx,
  closingUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Id,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const workflowitems = await repository.getWorkflowitems(projectId, subprojectId);
  if (Result.isErr(workflowitems)) {
    logger.warn(workflowitems);
    return new NotFound(ctx, "subproject", subprojectId);
  }

  const subproject = await repository.getSubproject(projectId, subprojectId);
  if (Result.isErr(subproject)) {
    return new VError(`Couldn't get workflowitem ordering for ${subprojectId}`, subproject);
  }

  const { workflowitemOrdering } = subproject;

  const sortedWorkflowitems = sortWorkflowitems(workflowitems, workflowitemOrdering);
  const workflowitemToClose = sortedWorkflowitems.find(item => item.id === workflowitemId);

  if (workflowitemToClose === undefined) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  // Don't do anything in case the workflowitem is already closed:
  if (workflowitemToClose.status === "closed") {
    return { newEvents: [] };
  }

  const publisher = closingUser.id;
  const closeEvent = WorkflowitemClosed.createEvent(
    ctx.source,
    publisher,
    projectId,
    subprojectId,
    workflowitemId,
  );

  // Check authorization (if not root):
  if (closingUser.id !== "root") {
    const isAuthorized = (workflowitemToClose.permissions["workflowitem.close"] || []).some(
      identity => canAssumeIdentity(closingUser, identity),
    );
    if (!isAuthorized) {
      return new NotAuthorized(ctx, closingUser.id, closeEvent);
    }
  }

  // Make sure all previous items (wrt. the ordering) are already closed:
  for (const item of sortedWorkflowitems) {
    if (item.id === workflowitemId) {
      break;
    }
    if (item.status !== "closed") {
      return new PreconditionError(ctx, closeEvent, "all previous workflowitems must be closed");
    }
  }

  // Check that the new event is indeed valid:
  const result = WorkflowitemClosed.apply(ctx, closeEvent, workflowitemToClose);

  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, closeEvent, [result]);
  }

  // Create notification events:
  const recipients = workflowitemToClose.assignee
    ? await repository.getUsersForIdentity(workflowitemToClose.assignee)
    : [];
  const notifications = recipients
    // The issuer doesn't receive a notification:
    .filter(userId => userId !== closingUser.id)
    .map(recipient =>
      NotificationCreated.createEvent(ctx.source, closingUser.id, recipient, closeEvent, projectId),
    );

  return { newEvents: [closeEvent, ...notifications] };
}
