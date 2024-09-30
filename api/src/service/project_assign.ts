import { VError } from "verror";

import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import { ConnToken } from "./conn";
import * as GroupQuery from "./domain/organization/group_query";
import { Identity } from "./domain/organization/identity";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as ProjectAssign from "./domain/workflow/project_assign";
import * as ProjectSnapshotPublish from "./domain/workflow/project_snapshot_publish";
import * as ProjectCacheHelper from "./project_cache_helper";
import { store } from "./store";

export async function assignProject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  assignee: Identity,
): Promise<Result.Type<void>> {
  logger.debug({ projectId, assignee }, "Assigning project to user");

  const assignProjectresult = await ProjectAssign.assignProject(
    ctx,
    serviceUser,
    projectId,
    assignee,
    {
      getProject: async () => {
        return await ProjectCacheHelper.getProject(conn, ctx, projectId);
      },
      getUsersForIdentity: async (identity) => {
        return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
      },
    },
  );

  if (Result.isErr(assignProjectresult)) {
    return new VError(assignProjectresult, `assign ${assignee} to project failed`);
  }

  const { newEvents } = assignProjectresult;

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
