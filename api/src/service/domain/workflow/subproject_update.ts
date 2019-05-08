import Joi = require("joi");
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
import * as SubprojectEventSourcing from "./subproject_eventsourcing";
import * as SubprojectUpdated from "./subproject_updated";

export type RequestData = SubprojectUpdated.UpdatedData;
export const requestDataSchema = SubprojectUpdated.updatedDataSchema;

export function validate(input: any): Result.Type<RequestData> {
  const { value, error } = Joi.validate(input, requestDataSchema);
  return !error ? value : error;
}

interface Repository {
  getSubproject(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Subproject.Subproject>>;
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
}

export async function updateSubproject(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[] }>> {
  const subproject = await repository.getSubproject(subprojectId, subprojectId);

  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  // Create the new event:
  const subprojectUpdated = SubprojectUpdated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    data,
  );
  if (Result.isErr(subprojectUpdated)) {
    return new VError(subprojectUpdated, "failed to create event");
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "subproject.update";
    if (!Subproject.permits(subproject, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: subproject });
    }
  }

  // Check that the new event is indeed valid:
  const result = SubprojectEventSourcing.newSubprojectFromEvent(ctx, subproject, subprojectUpdated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, subprojectUpdated, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqualIgnoringLog(subproject, result)) {
    return { newEvents: [] };
  }

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
        subprojectUpdated,
        projectId,
        subprojectId,
      ),
    );

  return { newEvents: [subprojectUpdated, ...notifications] };
}

function isEqualIgnoringLog(
  subprojectA: Subproject.Subproject,
  subprojectB: Subproject.Subproject,
): boolean {
  const { log: logA, ...a } = subprojectA;
  const { log: logB, ...b } = subprojectB;
  return isEqual(a, b);
}
