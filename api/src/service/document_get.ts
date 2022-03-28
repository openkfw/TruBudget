import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { StoredDocument } from "./domain/document/document";
import * as DocumentGet from "./domain/document/document_get";

export async function getDocuments(
  conn: ConnToken,
  ctx: Ctx,
): Promise<Result.Type<StoredDocument[]>> {
  return Cache.withCache(conn, ctx, async (cache) =>
    DocumentGet.getAllDocumentInfos(ctx, {
      getDocumentsEvents: async () => {
        return cache.getDocumentUploadedEvents();
      },
      getAllProjects: async () => {
        return cache.getProjects();
      },
      getAllSubprojects: async (projectId) => {
        return cache.getSubprojects(projectId);
      },
      getAllWorkflowitems: async (projectId, subprojectId) => {
        return cache.getWorkflowitems(projectId, subprojectId);
      },
    }),
  );
}
