import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import { CurrencyCode } from "./domain/workflow/money";
import * as Project from "./domain/workflow/project";
import { ProjectedBudget } from "./domain/workflow/projected_budget";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectProjectedBudgetDelete from "./domain/workflow/subproject_projected_budget_delete";
import * as SubprojectSnapshotPublish from "./domain/workflow/subproject_snapshot_publish";
import { store } from "./store";
import * as SubprojectCacheHelper from "./subproject_cache_helper";

export async function deleteProjectedBudget(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  organization: string,
  currencyCode: CurrencyCode,
): Promise<Result.Type<ProjectedBudget[]>> {
  logger.debug({ projectId, subprojectId, organization, currencyCode }, "Deleting project budget");

  const deleteProjectedBudgetResult = await SubprojectProjectedBudgetDelete.deleteProjectedBudget(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    organization,
    currencyCode,
    {
      getSubproject: async (pId, spId) => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, pId, spId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    },
  );
  if (Result.isErr(deleteProjectedBudgetResult)) {
    return new VError(deleteProjectedBudgetResult, "delete projected budget of subproject failed");
  }
  const { newEvents, projectedBudgets } = deleteProjectedBudgetResult;
  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  const { canPublish, eventData } = await SubprojectSnapshotPublish.publishSubprojectSnapshot(
    ctx,
    conn,
    projectId,
    subprojectId,
    serviceUser,
  );
  if (canPublish) {
    if (Result.isErr(eventData)) {
      return new VError(eventData, "create subproject snapshot failed");
    }
    const publishEvent = eventData;
    await store(conn, ctx, publishEvent, serviceUser.address);
  }

  return projectedBudgets;
}
