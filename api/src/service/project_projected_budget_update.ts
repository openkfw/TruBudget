import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import { CurrencyCode, MoneyAmount } from "./domain/workflow/money";
import * as Project from "./domain/workflow/project";
import * as ProjectProjectedBudgetUpdate from "./domain/workflow/project_projected_budget_update";
import * as ProjectSnapshotPublish from "./domain/workflow/project_snapshot_publish";
import { ProjectedBudget } from "./domain/workflow/projected_budget";
import * as ProjectCacheHelper from "./project_cache_helper";
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
  logger.debug({ projectId, organization, value, currencyCode }, "Updating project budget");

  const updateProjectedBudgetResult = await ProjectProjectedBudgetUpdate.updateProjectedBudget(
    ctx,
    serviceUser,
    projectId,
    organization,
    value,
    currencyCode,
    {
      getProject: async (pId) => {
        return await ProjectCacheHelper.getProject(conn, ctx, pId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    },
  );

  if (Result.isErr(updateProjectedBudgetResult)) {
    return new VError(updateProjectedBudgetResult, "delete projected budget failed");
  }

  const { newEvents, projectedBudgets } = updateProjectedBudgetResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  const { canPublish, eventData } = await ProjectSnapshotPublish.publishProjectSnapshot(
    ctx,
    conn,
    projectId,
    serviceUser,
  );
  if (canPublish) {
    if (Result.isErr(eventData)) {
      return new VError(eventData, "create project snapshot failed");
    }
    const publishEvent = eventData;
    await store(conn, ctx, publishEvent, serviceUser.address);
  }
  return projectedBudgets;
}
