import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as SubprojectGet from "./domain/workflow/subproject_get";

export async function getSubproject(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
): Promise<Result.Type<Subproject.Subproject>> {
  const subprojectResult = await Cache.withCache(conn, ctx, async (cache) =>
    SubprojectGet.getSubproject(ctx, serviceUser, subprojectId, {
      getSubproject: async () => {
        return cache.getSubproject(projectId, subprojectId);
      },
    }),
  );
  return Result.mapErr(
    subprojectResult,
    (err) => new VError(err, `could not fetch subproject ${subprojectId}`),
  );
}
