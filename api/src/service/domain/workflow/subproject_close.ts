import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
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
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
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

  // Make sure all workflowitems are already closed:
  const workflowitems = await repository.getWorkflowitems(projectId, subprojectId);
  if (Result.isErr(workflowitems)) {
    return new PreconditionError(
      ctx,
      subprojectClosed,
      `could not find workflowitems for subproject ${subprojectId} of project ${projectId}`,
    );
  }
  if (workflowitems.some(x => x.status !== "closed")) {
    return new PreconditionError(
      ctx,
      subprojectClosed,
      "at least one workflowitem is not closed yet",
    );
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "subproject.close";
    if (!Subproject.permits(subproject, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: subproject });
    }
  }

  // Check that the new event is indeed valid:
  const result = SubprojectEventSourcing.newSubprojectFromEvent(ctx, subproject, subprojectClosed);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, subprojectClosed, [result]);
  }
  subproject = result;

  // Create notification events:
  const recipients = subproject.assignee
    ? await repository.getUsersForIdentity(subproject.assignee)
    : [];
  const notifications = recipients
    // The issuer doesn't receive a notification:
    .filter(userId => userId !== issuer.id)
    .map(recipient =>
      NotificationCreated.createEvent(
        ctx.source,
        issuer.id,
        recipient,
        subprojectClosed,
        projectId,
        subprojectId,
      ),
    );

  return { newEvents: [subprojectClosed, ...notifications], subproject };
}
