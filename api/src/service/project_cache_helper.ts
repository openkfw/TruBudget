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
  let projects: Array<Project.Project> = [];
  let i;
  for (i = 0; i <= streams.length - 1; i++) {
    const projectResult = await getProject(conn, ctx, streams[i].name);
    if (Result.isOk(projectResult)) {
      projects.push(projectResult);
    }
  }
  return projects;
}
