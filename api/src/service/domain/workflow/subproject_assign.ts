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
import * as SubprojectAssigned from "./subproject_assigned";
import * as SubprojectEventSourcing from "./subproject_eventsourcing";

interface Repository {
  getSubproject(): Promise<Result.Type<Subproject.Subproject>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
}

export async function assignSubproject(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  assignee: Identity,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; subproject: Subproject.Subproject }>> {
  let subproject = await repository.getSubproject();
  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  if (subproject.assignee === assignee) {
    // This is already assigned to that user.
    return { newEvents: [], subproject };
  }

  // Create the new event:
  const subprojectAssignedResult = SubprojectAssigned.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    assignee,
  );
  if (Result.isErr(subprojectAssignedResult)) {
    return new VError(subprojectAssignedResult, "failed to create event");
  }
  const subprojectAssigned = subprojectAssignedResult;

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "subproject.assign";
    if (!Subproject.permits(subproject, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: subproject });
    }
  }

  // Check that the new event is indeed valid:
  const result = SubprojectEventSourcing.newSubprojectFromEvent(
    ctx,
    subproject,
    subprojectAssigned,
  );
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, subprojectAssigned, [result]);
  }
  subproject = result;

  // Create notification events:
  const recipientsResult = await repository.getUsersForIdentity(assignee);
  if (Result.isErr(recipientsResult)) {
    return new VError(recipientsResult, `fetch users for ${assignee} failed`);
  }
  const notifications = recipientsResult.reduce((notifications, recipient) => {
    // The issuer doesn't receive a notification:
    if (recipient !== issuer.id) {
      const notification = NotificationCreated.createEvent(
          ctx.source,
          issuer.id,
          recipient,
          subprojectAssigned,
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
    return new VError(notifications, "failed to create notification events");
  }
  return { newEvents: [subprojectAssigned, ...notifications], subproject };
}
