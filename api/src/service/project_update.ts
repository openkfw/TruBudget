import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectUpdate from "./domain/workflow/project_update";
import * as ProjectCacheHelper from "./project_cache_helper";
import { store } from "./store";

import * as ProjectSnapshotPublish from "./domain/workflow/project_snapshot_publish";

export async function updateProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  requestData: ProjectUpdate.RequestData,
): Promise<Result.Type<void>> {
  logger.debug({ req: requestData }, "Updating project");

  const newEventsResult = await ProjectUpdate.updateProject(
    ctx,
    serviceUser,
    projectId,
    requestData,
    {
      getProject: async (pId) => {
        return await ProjectCacheHelper.getProject(conn, ctx, pId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    },
  );

  if (Result.isErr(newEventsResult)) {
    return new VError(newEventsResult, "grant project permission failed");
  }

  const newEvents = newEventsResult;

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
