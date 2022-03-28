import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as DocumentGet from "./domain/document/document_get";
import * as DocumentUploaded from "./domain/document/document_uploaded";

export async function getDocuments(
  conn: ConnToken,
  ctx: Ctx,
): Promise<Result.Type<DocumentUploaded.Document[]>> {
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
