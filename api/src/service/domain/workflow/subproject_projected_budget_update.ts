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

interface Repository {
  getSubprojectEvents(): Promise<BusinessEvent[]>;
}

type State = ProjectedBudget[];
type ReturnType = { newEvents: BusinessEvent[]; newState: State; errors: Error[] };

function withError(error: Error): ReturnType {
  return { newEvents: [], newState: [], errors: [error] };
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
): Promise<ReturnType> {
  const subprojectEvents = await repository.getSubprojectEvents();
  const { subprojects } = sourceSubprojects(ctx, subprojectEvents);

  const subproject = subprojects.find(x => x.id === subprojectId);
  if (subproject === undefined) {
    return withError(new NotFound(ctx, "subproject", subprojectId));
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
      return withError(new NotAuthorized(ctx, issuer.id, budgetUpdated));
    }
  }

  // Check that the new event is indeed valid:
  const { subprojects: subprojectsAfterUpdate, errors } = sourceSubprojects(
    ctx,
    subprojectEvents.concat([budgetUpdated]),
  );
  if (errors.length > 0) {
    return withError(new InvalidCommand(ctx, budgetUpdated, errors));
  }

  const subprojectAfterUpdate = subprojectsAfterUpdate.find(x => x.id === subprojectId);
  if (subprojectAfterUpdate === undefined) {
    logger.fatal(
      { ctx, issuer, projectId, subprojectId, subprojects, budgetUpdated },
      `panic: failed to source subproject ${subprojectId} after updating a projected budget`,
    );
    process.exit(1);
  }

  return {
    newEvents: [budgetUpdated],
    newState: subprojectAfterUpdate!.projectedBudgets,
    errors: [],
  };
}
