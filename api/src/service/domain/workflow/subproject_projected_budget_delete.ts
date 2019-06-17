import { isEqual } from "lodash";

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
import * as SubprojectProjectedBudgetDeleted from "./subproject_projected_budget_deleted";

interface Repository {
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
  getUsersForIdentity(identity: Identity): Promise<UserRecord.Id[]>;
}

export async function deleteProjectedBudget(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  organization: string,
  currencyCode: string,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; projectedBudgets: ProjectedBudget[] }>> {
  const subproject = await repository.getSubproject(projectId, subprojectId);
  if (Result.isErr(subproject)) {
    return new NotFound(ctx, "subproject", subprojectId);
  }

  // Create the new event:
  const budgetDeleted = SubprojectProjectedBudgetDeleted.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    organization,
    currencyCode,
  );

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "subproject.budget.deleteProjected";
    if (!Subproject.permits(subproject, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: subproject });
    }
  }

  // Check that the new event is indeed valid:
  const result = SubprojectEventSourcing.newSubprojectFromEvent(ctx, subproject, budgetDeleted);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, budgetDeleted, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqual(subproject.projectedBudgets, result.projectedBudgets)) {
    return { newEvents: [], projectedBudgets: result.projectedBudgets };
  } else {
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
          budgetDeleted,
          projectId,
          subprojectId,
        ),
      );
    return {
      newEvents: [budgetDeleted, ...notifications],
      projectedBudgets: result.projectedBudgets,
    };
  }
}
