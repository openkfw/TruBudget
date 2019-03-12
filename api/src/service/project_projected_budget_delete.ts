import { Ctx } from "../lib/ctx";
import * as Cache2 from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { CurrencyCode } from "./domain/workflow/money";
import * as Project from "./domain/workflow/project";
import * as ProjectProjectedBudgetDelete from "./domain/workflow/project_projected_budget_delete";
import { ProjectedBudget } from "./domain/workflow/projected_budget";
import { store } from "./store";

export async function deleteProjectedBudget(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  organization: string,
  currencyCode: CurrencyCode,
): Promise<ProjectedBudget[]> {
  const {
    newEvents,
    newState: projectedBudgets,
    errors,
  } = await ProjectProjectedBudgetDelete.deleteProjectedBudget(
    ctx,
    serviceUser,
    projectId,
    organization,
    currencyCode,
    {
      getProjectEvents: async () => {
        await Cache2.refresh(conn, projectId);
        return conn.cache2.eventsByStream.get(projectId) || [];
      },
    },
  );
  if (errors.length > 0) return Promise.reject(errors);
  if (!newEvents.length) {
    return Promise.reject(`Generating events failed: ${JSON.stringify(newEvents)}`);
  }

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  return projectedBudgets;
}
