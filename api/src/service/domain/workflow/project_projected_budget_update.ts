import { isEqual } from "lodash";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import * as ProjectEventSourcing from "./project_eventsourcing";
import * as ProjectProjectedBudgetUpdated from "./project_projected_budget_updated";
import { ProjectedBudget } from "./projected_budget";

interface Repository {
  getProject(projectId: Project.Id): Promise<Result.Type<Project.Project>>;
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
): Promise<Result.Type<{ newEvents: BusinessEvent[]; newState: State }>> {
  const project = await repository.getProject(projectId);

  if (Result.isErr(project)) {
    return new NotFound(ctx, "project", projectId);
  }

  // Create the new event:
  const budgetUpdated = ProjectProjectedBudgetUpdated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    organization,
    value,
    currencyCode,
  );

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "project.budget.updateProjected";
    if (!Project.permits(project, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: project });
    }
  }

  // Check that the new event is indeed valid:
  const result = ProjectEventSourcing.newProjectFromEvent(ctx, project, budgetUpdated);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, budgetUpdated, [result]);
  }

  // Only emit the event if it causes any changes:
  if (isEqual(project.projectedBudgets, result.projectedBudgets)) {
    return { newEvents: [], newState: result.projectedBudgets };
  } else {
    return {
      newEvents: [budgetUpdated],
      newState: result.projectedBudgets,
    };
  }
}
