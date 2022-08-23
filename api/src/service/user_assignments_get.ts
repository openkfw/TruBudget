import logger from "lib/logger";
import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache/index";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserQuery from "./domain/organization/user_query";
import * as UserAssignments from "./domain/workflow/user_assignments";
import * as UserAssignmentsGet from "./domain/workflow/user_assignments_get";

export async function getUserAssignments(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  issuerOrganization: string,
  requestData: UserAssignmentsGet.RequestData,
): Promise<Result.Type<UserAssignments.UserAssignments>> {
  logger.debug({ req: requestData }, "Get user assignments");

  const userAssignmentResult = await Cache.withCache(conn, ctx, async (cache) =>
    UserAssignmentsGet.getUserAssignments(ctx, requestData.userId, issuer, issuerOrganization, {
      getAllProjects: async () => {
        return cache.getProjects();
      },
      getSubprojects: async (pId) => {
        return cache.getSubprojects(pId);
      },
      getWorkflowitems: async (pId, spId) => {
        return cache.getWorkflowitems(pId, spId);
      },
      getUser: () => UserQuery.getUser(conn, ctx, issuer, requestData.userId),
    }),
  );
  return Result.mapErr(
    userAssignmentResult,
    (err) => new VError(err, `could not fetch user assignments: ${requestData.userId}`),
  );
}
