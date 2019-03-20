import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { ProjectedBudget } from "./projected_budget";
import * as Subproject from "./subproject";
import { sourceSubprojects } from "./subproject_eventsourcing";
import * as SubprojectProjectedBudgetUpdated from "./subproject_projected_budget_updated";
import * as Result from "../../../result";

interface Repository {
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
}

type State = ProjectedBudget[];

export async function updateProjectedBudget(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  organization: string,
  value: string,
  currencyCode: string,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; newState: State }>> {
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

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    if (!Subproject.permits(subproject, issuer, ["subproject.budget.updateProjected"])) {
      return new NotAuthorized(ctx, issuer.id, budgetUpdated);
    }
  }

  // Check that the new event is indeed valid:

  const result = SubprojectProjectedBudgetUpdated.apply(ctx, budgetUpdated, subproject);

  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, budgetUpdated, [result]);
  }

  return {
    newEvents: [budgetUpdated],
    newState: result.projectedBudgets,
  };
}
