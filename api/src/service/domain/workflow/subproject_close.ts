import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotFound } from "../errors/not_found";
import { PreconditionError } from "../errors/precondition_error";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import * as NotificationCreated from "./notification_created";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as SubprojectClosed from "./subproject_closed";
import * as SubprojectEventSourcing from "./subproject_eventsourcing";
import * as Workflowitem from "./workflowitem";

interface Repository {
  getSubproject(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Subproject.Subproject>>;
  getWorkflowitems(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
}

export async function closeSubproject(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; subproject: Subproject.Subproject }>> {
  let subproject = await repository.getSubproject(projectId, subprojectId);
  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  if (subproject.status === "closed") {
    // The project is already closed.
    return { newEvents: [], subproject };
  }

  // Create the new event:
  const subprojectClosed = SubprojectClosed.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
  );
  if (Result.isErr(subprojectClosed)) {
    return new VError(subprojectClosed, "failed to create event");
  }

  const assignedIdentitiesResult = await repository.getUsersForIdentity(subproject.assignee);
  if (Result.isErr(assignedIdentitiesResult)) {
    return new VError(assignedIdentitiesResult, `fetch users for ${subproject.assignee} failed`);
  }
  const assignedIdentities = assignedIdentitiesResult;

  if (issuer.id !== "root" && !assignedIdentities.includes(issuer.id)) {
    return new PreconditionError(
      ctx,
      subprojectClosed,
      "Only the assignee is allowed to close the subproject.",
    );
  }

  // Make sure all workflowitems are already closed:
  const workflowitems = await repository.getWorkflowitems(projectId, subprojectId);
  if (Result.isErr(workflowitems)) {
    return new PreconditionError(
      ctx,
      subprojectClosed,
      `could not find workflowitems for subproject ${subprojectId} of project ${projectId}`,
    );
  }
  if (workflowitems.some((x) => x.status !== "closed")) {
    return new PreconditionError(
      ctx,
      subprojectClosed,
      "at least one workflowitem is not closed yet",
    );
  }

  // Check that the new event is indeed valid:
  const result = SubprojectEventSourcing.newSubprojectFromEvent(ctx, subproject, subprojectClosed);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, subprojectClosed, [result]);
  }
  subproject = result;

  // Create notification events:
  const notifications: Result.Type<NotificationCreated.Event[]> = assignedIdentities.reduce(
    (notifications, recipient) => {
      // The issuer doesn't receive a notification:
      if (recipient !== issuer.id) {
        const notification = NotificationCreated.createEvent(
          ctx.source,
          issuer.id,
          recipient,
          subprojectClosed,
          projectId,
        );
        if (Result.isErr(notification)) {
          return new VError(notification, "failed to create event");
        }
        notifications.push(notification);
      }
      return notifications;
    },
    [] as NotificationCreated.Event[],
  );
  if (Result.isErr(notifications)) {
    return new VError(notifications, "failed to create notification events");
  }
  return { newEvents: [subprojectClosed, ...notifications], subproject };
}
