import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { ServiceUser } from "../organization/service_user";
import * as Project from "./project";
import { sourceProjects } from "./project_eventsourcing";
import * as ProjectProjectedBudgetUpdated from "./project_projected_budget_updated";
import { ProjectedBudget } from "./projected_budget";

interface Repository {
  getProjectEvents(): Promise<BusinessEvent[]>;
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
  organization: string,
  value: string,
  currencyCode: string,
  repository: Repository,
): Promise<ReturnType> {
  const projectEvents = await repository.getProjectEvents();
  const { projects } = sourceProjects(ctx, projectEvents);

  const project = projects.find(x => x.id === projectId);
  if (project === undefined) {
    return withError(new NotFound(ctx, "project", projectId));
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
      return withError(new NotAuthorized(ctx, issuer.id, budgetUpdated));
    }
  }

  // Check that the new event is indeed valid:
  const { projects: projectsAfterUpdate, errors } = sourceProjects(
    ctx,
    projectEvents.concat([budgetUpdated]),
  );
  if (errors.length > 0) {
    return withError(new InvalidCommand(ctx, budgetUpdated, errors));
  }

  const projectAfterUpdate = projectsAfterUpdate.find(x => x.id === projectId);
  if (projectAfterUpdate === undefined) {
    logger.fatal(
      { ctx, issuer, projectId, projects, budgetUpdated },
      `panic: failed to source project ${projectId} after updating a projected budget`,
    );
    process.exit(1);
  }

  return {
    newEvents: [budgetUpdated],
    newState: projectAfterUpdate!.projectedBudgets,
    errors: [],
  };
}
