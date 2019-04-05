import { Ctx } from "../lib/ctx";
import * as Result from "../result";
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
  const result = await Cache.withCache(conn, ctx, async cache =>
    ProjectProjectedBudgetDelete.deleteProjectedBudget(
      ctx,
      serviceUser,
      projectId,
      organization,
      currencyCode,
      {
        getProject: async pId => {
          return cache.getProject(pId);
        },
      },
    ),
  );
  if (Result.isErr(result)) return Promise.reject(result);

  for (const event of result.newEvents) {
    await store(conn, ctx, event);
  }

  return result.projectedBudgets;
}
