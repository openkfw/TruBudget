import { isEqual } from "lodash";
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
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
import * as ProjectEventSourcing from "./project_eventsourcing";
import * as ProjectProjectedBudgetUpdated from "./project_projected_budget_updated";
import { ProjectedBudget } from "./projected_budget";

interface Repository {
  getProject(projectId: Project.Id): Promise<Result.Type<Project.Project>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
}

type State = ProjectedBudget[];

export async function updateProjectedBudget(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  organization: string,
  value: string,
  currencyCode: string,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; projectedBudgets: State }>> {
  const project = await repository.getProject(projectId);

  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  logger.trace(
    { issuer, organization, projectId },
    "Creating project_projected_budget_updated event",
  );
  const budgetUpdated = ProjectProjectedBudgetUpdated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    organization,
    value,
    currencyCode,
    new Date().toISOString(),
    issuer.metadata,
  );
  if (Result.isErr(budgetUpdated)) {
    return new VError(budgetUpdated, "failed to create projected budget updated event");
  }

  logger.trace({ issuer }, "Checking if user has permissions");
  if (issuer.id !== "root") {
    const intent = "project.budget.updateProjected";
    if (
      !(
        Project.permits(project, issuer, [intent]) ||
        Project.permits(project, issuer, ["project.update"])
      )
    ) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: project });
    }
  }

  logger.trace({ event: budgetUpdated }, "Checking event validity");
  const result = ProjectEventSourcing.newProjectFromEvent(ctx, project, budgetUpdated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, budgetUpdated, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqual(project.projectedBudgets, result.projectedBudgets)) {
    return { newEvents: [], projectedBudgets: result.projectedBudgets };
  }

  logger.trace("Creating notification events");
  const recipientsResult = project.assignee
    ? await repository.getUsersForIdentity(project.assignee)
    : [];
  if (Result.isErr(recipientsResult)) {
    return new VError(recipientsResult, `fetch users for ${project.assignee} failed`);
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
        undefined,
        undefined,
        new Date().toISOString(),
        issuer.metadata,
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
