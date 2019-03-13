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
import * as SubprojectProjectedBudgetDeleted from "./subproject_projected_budget_deleted";

interface Repository {
  getSubprojectEvents(): Promise<BusinessEvent[]>;
}

type State = ProjectedBudget[];
type ReturnType = { newEvents: BusinessEvent[]; newState: State; errors: Error[] };

function withError(error: Error): ReturnType {
  return { newEvents: [], newState: [], errors: [error] };
}

export async function deleteProjectedBudget(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  organization: string,
  currencyCode: string,
  repository: Repository,
): Promise<ReturnType> {
  const subprojectEvents = await repository.getSubprojectEvents();
  const { subprojects } = sourceSubprojects(ctx, subprojectEvents);

  const subproject = subprojects.find(x => x.id === subprojectId);
  if (subproject === undefined) {
    return withError(new NotFound(ctx, "subproject", subprojectId));
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
      return withError(new NotAuthorized(ctx, issuer.id, budgetDeleted));
    }
  }

  // Check that the new event is indeed valid:
  const { subprojects: subprojectsAfterUpdate, errors } = sourceSubprojects(
    ctx,
    subprojectEvents.concat([budgetDeleted]),
  );
  if (errors.length > 0) {
    return withError(new InvalidCommand(ctx, budgetDeleted, errors));
  }

  const subprojectAfterUpdate = subprojectsAfterUpdate.find(x => x.id === subprojectId);
  if (subprojectAfterUpdate === undefined) {
    logger.fatal(
      { ctx, issuer, projectId, subprojectId, subprojects, budgetDeleted },
      `panic: failed to source subproject ${projectId} after deleting a projected budget`,
    );
    process.exit(1);
  }

  return {
    newEvents: [budgetDeleted],
    newState: subprojectAfterUpdate!.projectedBudgets,
    errors: [],
  };
}
