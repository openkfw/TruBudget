import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectAssign from "./domain/workflow/subproject_assign";
import * as SubprojectSnapshotPublish from "./domain/workflow/subproject_snapshot_publish";
import { store } from "./store";
import * as SubprojectCacheHelper from "./subproject_cache_helper";

export async function assignSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  assignee: Identity,
): Promise<Result.Type<void>> {
  logger.debug({ projectId, subprojectId, assignee }, "Assigning subproject");

  const assignSubprojectResult = await SubprojectAssign.assignSubproject(
    ctx,
    serviceUser,
    projectId,
    subprojectId,
    assignee,
    {
      getSubproject: async () => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, projectId, subprojectId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    },
  );

  if (Result.isErr(assignSubprojectResult)) {
    return new VError(assignSubprojectResult, `assign ${assignee} to subproject failed`);
  }
  const { newEvents } = assignSubprojectResult;

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
}
