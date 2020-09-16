import { Ctx } from "../lib/ctx";
import { VError } from "verror";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as Result from "../result";
import * as UserAssignmentsGet from "./domain/workflow/user_assignments_get";
import * as UserAssignments from "./domain/workflow/user_assignments";
import * as UserQuery from "./user_query";
import { ServiceUser } from "./domain/organization/service_user";

export async function getUserAssignments(
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  issuerOrganization: string,
  requestData: UserAssignmentsGet.RequestData,
): Promise<Result.Type<UserAssignments.UserAssignments>> {
  const userAssignmentResult = await Cache.withCache(
    conn,
    ctx,
    async (cache) =>
      await UserAssignmentsGet.getUserAssignments(
        ctx,
        requestData.userId,
        issuer,
        issuerOrganization,
        {
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
        },
      ),
  );
  return Result.mapErr(
    userAssignmentResult,
    (err) => new VError(err, `could not fetch user assignments: ${requestData.userId}`),
  );
}
