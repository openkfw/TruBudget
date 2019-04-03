import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { ProjectedBudget } from "./projected_budget";
import * as ProjectProjectedBudgetDeleted from "./project_projected_budget_deleted";

interface Repository {
  getProject(projectId: Project.Id): Promise<Result.Type<Project.Project>>;
}

type State = ProjectedBudget[];

export async function deleteProjectedBudget(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  organization: string,
  currencyCode: string,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; newState: State }>> {
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

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "project.budget.deleteProjected";
    if (!Project.permits(project, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: project });
    }
  }

  // Check that the new event is indeed valid:
  const result = ProjectProjectedBudgetDeleted.apply(ctx, budgetDeleted, project);
  if (Result.isErr(result)) {
    return new InvalidCommand(ctx, budgetDeleted, [result]);
  }

  return {
    newEvents: [budgetDeleted],
    newState: result.projectedBudgets,
  };
}
