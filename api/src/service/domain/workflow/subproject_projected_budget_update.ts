import { isEqual } from "lodash";
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
import { ProjectedBudget } from "./projected_budget";
import * as Subproject from "./subproject";
import * as SubprojectEventSourcing from "./subproject_eventsourcing";
import * as SubprojectProjectedBudgetUpdated from "./subproject_projected_budget_updated";

interface Repository {
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
}

export async function updateProjectedBudget(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  organization: string,
  value: string,
  currencyCode: string,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; projectedBudgets: ProjectedBudget[] }>> {
  const subproject = await repository.getSubproject(projectId, subprojectId);
  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }
  // Create the new event:
  const budgetUpdated = SubprojectProjectedBudgetUpdated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    organization,
    value,
    currencyCode,
  );
  if (Result.isErr(budgetUpdated)) {
    return new VError(budgetUpdated, "failed to create projected budget updated event");
  }
  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "subproject.budget.updateProjected";
    if (!Subproject.permits(subproject, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: subproject });
    }
  }

  // Check that the new event is indeed valid:
  const result = SubprojectEventSourcing.newSubprojectFromEvent(ctx, subproject, budgetUpdated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, budgetUpdated, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqual(subproject.projectedBudgets, result.projectedBudgets)) {
    return { newEvents: [], projectedBudgets: result.projectedBudgets };
  } else {
    // Create notification events:
    const recipientsResult = subproject.assignee
      ? await repository.getUsersForIdentity(subproject.assignee)
      : [];
    if (Result.isErr(recipientsResult)) {
      return new VError(recipientsResult, `fetch users for ${subproject.assignee} failed`);
    }
    const notifications = recipientsResult.reduce((notifications, recipient) => {
      // The issuer doesn't receive a notification:
      if (recipient !== issuer.id) {
        const notification = NotificationCreated.createEvent(
          ctx.source,
          issuer.id,
          recipient,
          budgetUpdated,
          projectId,
        );
        if (Result.isErr(notification)) {
          return new VError(notification, "failed to create  event");
        }
        notifications.push(notification);
      }
      return notifications;
    }, [] as NotificationCreated.Event[]);
    if (Result.isErr(notifications)) {
      return new VError(notifications, "failed to create notification events");
    }
    return {
      newEvents: [budgetUpdated, ...notifications],
      projectedBudgets: result.projectedBudgets,
    };
  }
}
