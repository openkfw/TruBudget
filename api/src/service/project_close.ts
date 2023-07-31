import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectClose from "./domain/workflow/project_close";
import { store } from "./store";
import * as ProjectCacheHelper from "./project_cache_helper";
import * as ProjectSnapshotPublish from "./domain/workflow/project_snapshot_publish";
import * as SubprojectCacheHelper from "./subproject_cache_helper";

export async function closeProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
): Promise<Result.Type<void>> {
  logger.debug({ projectId }, "Closing project");

  const closeProjectResult = await ProjectClose.closeProject(ctx, serviceUser, projectId, {
    getProject: async () => {
      return await ProjectCacheHelper.getProject(conn, ctx, projectId);
    },
    getSubprojects: async (pId) => {
      return await SubprojectCacheHelper.getAllSubprojects(conn, ctx, pId);
    },
    getUsersForIdentity: async (identity) => {
      return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
    },
  });

  if (Result.isErr(closeProjectResult)) {
    return new VError(closeProjectResult, `close project ${projectId} failed`);
  }
  const { newEvents } = closeProjectResult;

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
}
