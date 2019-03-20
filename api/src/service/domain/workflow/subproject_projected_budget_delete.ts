import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { ProjectedBudget } from "./projected_budget";
import * as Subproject from "./subproject";
import * as SubprojectProjectedBudgetDeleted from "./subproject_projected_budget_deleted";

interface Repository {
  getSubproject(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Subproject.Subproject>>;
}

type State = ProjectedBudget[];

export async function deleteProjectedBudget(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  organization: string,
  currencyCode: string,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; newState: State }>> {
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
    if (!Subproject.permits(subproject, issuer, ["subproject.budget.deleteProjected"])) {
      return new NotAuthorized(ctx, issuer.id, budgetDeleted);
    }
  }

  // Check that the new event is indeed valid:
  const result = SubprojectProjectedBudgetDeleted.apply(ctx, budgetDeleted, subproject);

  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, budgetDeleted, [result]);
  }

  return {
    newEvents: [budgetDeleted],
    newState: result.projectedBudgets,
  };
}
