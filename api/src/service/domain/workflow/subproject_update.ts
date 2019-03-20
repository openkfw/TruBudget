import Joi = require("joi");

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
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
import * as ProjectUpdated from "./project_updated";
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

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    if (!Subproject.permits(subproject, issuer, ["subproject.update"])) {
      return new NotAuthorized(ctx, issuer.id, subprojectUpdated);
    }
  }

  // Check that the new event is indeed valid:

  const result = SubprojectUpdated.apply(ctx, subprojectUpdated, subproject);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, subprojectUpdated, [result]);
  }

  // Create notification events:
  let notifications: NotificationCreated.Event[] = [];
  if (subproject.assignee !== undefined && subproject.assignee !== issuer.id) {
    const recipients = await repository.getUsersForIdentity(subproject.assignee);
    notifications = recipients.map(recipient =>
      NotificationCreated.createEvent(
        ctx.source,
        issuer.id,
        recipient,
        subprojectUpdated,
        projectId,
        subprojectId,
      ),
    );
  }

  return { newEvents: [subprojectUpdated, ...notifications] };
}
