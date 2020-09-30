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
import * as ProjectEventSourcing from "./project_eventsourcing";
import * as ProjectProjectedBudgetDeleted from "./project_projected_budget_deleted";

interface Repository {
  getProject(projectId: Project.Id): Promise<Result.Type<Project.Project>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
}

type State = ProjectedBudget[];

export async function deleteProjectedBudget(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  organization: string,
  currencyCode: string,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; projectedBudgets: State }>> {
  const project = await repository.getProject(projectId);

  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  // Create the new event:
  const budgetDeleted = ProjectProjectedBudgetDeleted.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    organization,
    currencyCode,
  );
  if (Result.isErr(budgetDeleted)) {
    return new VError(budgetDeleted, "failed to create projected budget deleted event");
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "project.budget.deleteProjected";
    if (!Project.permits(project, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: project });
    }
  }

  // Check that the new event is indeed valid:
  const result = ProjectEventSourcing.newProjectFromEvent(ctx, project, budgetDeleted);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, budgetDeleted, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqual(project.projectedBudgets, result.projectedBudgets)) {
    return { newEvents: [], projectedBudgets: result.projectedBudgets };
  } else {
    // Create notification events:
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
        budgetDeleted,
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
      newEvents: [budgetDeleted, ...notifications],
      projectedBudgets: result.projectedBudgets,
    };
  }
}
