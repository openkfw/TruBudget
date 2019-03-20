import { Ctx } from "../lib/ctx";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { CurrencyCode, MoneyAmount } from "./domain/workflow/money";
import * as Project from "./domain/workflow/project";
import { ProjectedBudget } from "./domain/workflow/projected_budget";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectProjectedBudgetUpdate from "./domain/workflow/subproject_projected_budget_update";
import { store } from "./store";
import * as Result from "../result";

export async function updateProjectedBudget(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  organization: string,
  value: MoneyAmount,
  currencyCode: CurrencyCode,
): Promise<ProjectedBudget[]> {
  const result = await Cache.withCache(conn, ctx, async cache =>
    SubprojectProjectedBudgetUpdate.updateProjectedBudget(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      organization,
      value,
      currencyCode,
      {
        getSubproject: async (projectId, subprojectId) => {
          return cache.getSubproject(projectId, subprojectId);
        },
      },
    ),
  );
  if (Result.isErr(result)) return Promise.reject(result);

  for (const event of result.newEvents) {
    await store(conn, ctx, event);
  }

  return result.newState;
}
