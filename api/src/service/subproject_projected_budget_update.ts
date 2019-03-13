import { Ctx } from "../lib/ctx";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { CurrencyCode, MoneyAmount } from "./domain/workflow/money";
import * as Project from "./domain/workflow/project";
import { ProjectedBudget } from "./domain/workflow/projected_budget";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectProjectedBudgetUpdate from "./domain/workflow/subproject_projected_budget_update";
import { loadSubprojectEvents } from "./load";
import { store } from "./store";

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
  const {
    newEvents,
    newState: projectedBudgets,
    errors,
  } = await SubprojectProjectedBudgetUpdate.updateProjectedBudget(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    organization,
    value,
    currencyCode,
    {
      getSubprojectEvents: async () => loadSubprojectEvents(conn, projectId, subprojectId),
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
