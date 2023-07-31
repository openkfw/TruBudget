import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import { CurrencyCode } from "./domain/workflow/money";
import * as Project from "./domain/workflow/project";
import { ProjectedBudget } from "./domain/workflow/projected_budget";
import * as ProjectProjectedBudgetDelete from "./domain/workflow/project_projected_budget_delete";
import { store } from "./store";
import * as ProjectSnapshotPublish from "./domain/workflow/project_snapshot_publish";
import * as ProjectCacheHelper from "./project_cache_helper";

export async function deleteProjectedBudget(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  organization: string,
  currencyCode: CurrencyCode,
): Promise<Result.Type<ProjectedBudget[]>> {
  logger.debug({ projectId, organization, currencyCode }, "Deleting project budget");

  const deleteProjectedBudgetResult = await ProjectProjectedBudgetDelete.deleteProjectedBudget(
    ctx,
    serviceUser,
    projectId,
    organization,
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

  if (Result.isErr(deleteProjectedBudgetResult)) {
    return new VError(deleteProjectedBudgetResult, "delete projected budget failed");
  }

  const { newEvents, projectedBudgets } = deleteProjectedBudgetResult;

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
