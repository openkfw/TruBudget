import Joi = require("joi");
import isEqual = require("lodash.isequal");
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
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

export function validate(input): Result.Type<RequestData> {
  const { value, error } = requestDataSchema.validate(input);
  return !error ? value : error;
}

interface Repository {
  getSubproject(
    projectId: Project.Id,
    subprojectId: Subproject.Id,
  ): Promise<Result.Type<Subproject.Subproject>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
}

export async function updateSubproject(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  data: RequestData,
  repository: Repository,
): Promise<Result.Type<BusinessEvent[]>> {
  const subproject = await repository.getSubproject(subprojectId, subprojectId);

  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  logger.trace({ issuer, data }, "Creating subproject_updated event");
  const subprojectUpdatedResult = SubprojectUpdated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    data,
  );
  if (Result.isErr(subprojectUpdatedResult)) {
    return new VError(subprojectUpdatedResult, "failed to create event");
  }
  const subprojectUpdated = subprojectUpdatedResult;

  logger.trace({ issuer }, "Checking if user has permissions");
  const intent = "subproject.update";
  if (!Subproject.permits(subproject, issuer, [intent])) {
    return new NotAuthorized({ ctx, userId: issuer.id, intent, target: subproject });
  }

  logger.trace({ event: subprojectUpdated }, "Checking event validity");
  const result = SubprojectEventSourcing.newSubprojectFromEvent(ctx, subproject, subprojectUpdated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, subprojectUpdated, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqualIgnoringLog(subproject, result)) {
    return [];
  }

  logger.trace("Creating notification events");
  let notifications: Result.Type<NotificationCreated.Event[]> = [];
  if (subproject.assignee !== undefined) {
    const recipientsResult = await repository.getUsersForIdentity(subproject.assignee);
    if (Result.isErr(recipientsResult)) {
      return new VError(recipientsResult, `fetch users for ${subproject.assignee} failed`);
    }
    notifications = recipientsResult.reduce((notifications, recipient) => {
      // The issuer doesn't receive a notification:
      if (recipient !== issuer.id) {
        const notification = NotificationCreated.createEvent(
          ctx.source,
          issuer.id,
          recipient,
          subprojectUpdated,
          projectId,
        );
        if (Result.isErr(notification)) {
          return new VError(notification, "failed to create notification event");
        }
        notifications.push(notification);
      }
      return notifications;
    }, [] as NotificationCreated.Event[]);
  }

  if (Result.isErr(notifications)) {
    return new VError(notifications, "failed to create notification events");
  }

  return [subprojectUpdated, ...notifications];
}

function isEqualIgnoringLog(
  subprojectA: Subproject.Subproject,
  subprojectB: Subproject.Subproject,
): boolean {
  const { log: logA, ...a } = subprojectA;
  const { log: logB, ...b } = subprojectB;
  return isEqual(a, b);
}
