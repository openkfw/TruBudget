import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { CurrencyCode, MoneyAmount } from "./domain/workflow/money";
import * as Project from "./domain/workflow/project";
import { ProjectedBudget } from "./domain/workflow/projected_budget";
import * as ProjectProjectedBudgetUpdate from "./domain/workflow/project_projected_budget_update";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export async function updateProjectedBudget(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  organization: string,
  value: MoneyAmount,
  currencyCode: CurrencyCode,
): Promise<Result.Type<ProjectedBudget[]>> {
  const updateProjectedBudgetResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectProjectedBudgetUpdate.updateProjectedBudget(
      ctx,
      serviceUser,
      projectId,
      organization,
      value,
      currencyCode,
      {
        getProject: async (pId) => {
          return cache.getProject(pId);
        },
        getUsersForIdentity: async (identity) => {
          return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
        },
      },
    ),
  );
  if (Result.isErr(updateProjectedBudgetResult)) {
    return new VError(updateProjectedBudgetResult, "delete projected budget failed");
  }
  const { newEvents, projectedBudgets } = updateProjectedBudgetResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  return projectedBudgets;
}
