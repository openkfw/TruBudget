import { Ctx } from "../../../lib/ctx";
import { BusinessEvent } from "../business_event";
import * as Result from "../../../result";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { ProjectedBudget } from "./projected_budget";
import * as ProjectProjectedBudgetUpdated from "./project_projected_budget_updated";

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
    if (!Project.permits(project, issuer, ["project.budget.updateProjected"])) {
      return new NotAuthorized(ctx, issuer.id, budgetUpdated);
    }
  }

  // Check that the new event is indeed valid:

  const result = ProjectProjectedBudgetUpdated.apply(ctx, budgetUpdated, project);

  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, budgetUpdated, [result]);
  }

  return {
    newEvents: [budgetUpdated],
    newState: result.projectedBudgets,
  };
}
