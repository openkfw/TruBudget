import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { CurrencyCode } from "./domain/workflow/money";
import * as Project from "./domain/workflow/project";
import { ProjectedBudget } from "./domain/workflow/projected_budget";
import * as ProjectProjectedBudgetDelete from "./domain/workflow/project_projected_budget_delete";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export async function deleteProjectedBudget(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  organization: string,
  currencyCode: CurrencyCode,
): Promise<Result.Type<ProjectedBudget[]>> {
  const deleteProjectedBudgetResult = await Cache.withCache(conn, ctx, async (cache) =>
    ProjectProjectedBudgetDelete.deleteProjectedBudget(
      ctx,
      serviceUser,
      projectId,
      organization,
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
  if (Result.isErr(deleteProjectedBudgetResult)) {
    return new VError(deleteProjectedBudgetResult, "delete projected budget failed");
  }
  const { newEvents, projectedBudgets } = deleteProjectedBudgetResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  return projectedBudgets;
}
