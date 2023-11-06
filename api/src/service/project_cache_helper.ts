import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import { ConnToken } from "./conn";
import * as Project from "./domain/workflow/project";
import * as SnapshotService from "./cache_snapshot";

export async function getProject(
  conn: ConnToken,
  ctx: Ctx,
  projectId: Project.Id,
): Promise<Result.Type<Project.Project>> {
  return await SnapshotService.getLatestSnapshot(
    ctx,
    conn,
    projectId,
    "self",
    "project_snapshot_published",
  );
}

export async function getAllProjects(conn: ConnToken, ctx: Ctx): Promise<Project.Project[]> {
  const streams = (await conn.multichainClient.streams()).filter(
    (stream) => stream.details.kind === "project",
  );

  const projectPromises = streams.reduce((acc, currentStream, next) => {
    acc.push(getProject(conn, ctx, currentStream.name));
    return acc;
  }, [] as Promise<Result.Type<Project.Project>>[]);

  const results = await Promise.all(projectPromises);

  return results.reduce((acc, currentResult, next) => {
    const result = currentResult;
    if (Result.isOk(result)) {
      acc.push(result);
    }
    return acc;
  }, [] as Project.Project[]);
}
