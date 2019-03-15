import { Ctx } from "../lib/ctx";
import * as Cache from "./cache2";
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
  const { newEvents, newState: projectedBudgets, errors } = await Cache.withCache(
    conn,
    ctx,
    async cache =>
      ProjectProjectedBudgetDelete.deleteProjectedBudget(
        ctx,
        serviceUser,
        projectId,
        organization,
        currencyCode,
        {
          getProjectEvents: async () => {
            return cache.getProjectEvents(projectId);
          },
        },
      ),
  );
  if (errors.length > 0) return Promise.reject(errors);

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  return projectedBudgets;
}
