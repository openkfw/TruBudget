import { Ctx } from "../lib/ctx";
import * as Result from "../result";

import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { StoredDocument } from "./domain/document/document";
import * as DocumentGet from "./domain/document/document_get";
import * as ProjectCacheHelper from "./project_cache_helper";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";

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
        return await ProjectCacheHelper.getAllProjects(conn, ctx);
      },
      getAllSubprojects: async (projectId) => {
        return await SubprojectCacheHelper.getAllSubprojects(conn, ctx, projectId);
      },
      getAllWorkflowitems: async (projectId, subprojectId) => {
        return await WorkflowitemCacheHelper.getAllWorkflowitems(
          conn,
          ctx,
          projectId,
          subprojectId,
        );
      },
    }),
  );
}
