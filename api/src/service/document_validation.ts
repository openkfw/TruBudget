import logger from "lib/logger";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import * as DocumentValidate from "./domain/document/document_validate";
import * as GroupQuery from "./domain/organization/group_query";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import { store } from "./store";
import VError = require("verror");
import * as ProjectCacheHelper from "./project_cache_helper";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";
import { hashBase64String } from "./domain/document/document";

/**
 * Returns true if the given hash matches the given document.
 *
 * @param encoded Base64 encoded document.
 * @param encodedAndHashed SHA-256 hash of the document.
 */
export async function isSameDocument(
  documentBase64: string,
  expectedSHA256: string,
  documentId: string,
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
): Promise<Result.Type<boolean>> {
  logger.debug(`Validating wether passed hash matches document "${documentId}"`);

  let isDocumentValid = false;
  try {
    const computedHash = await hashBase64String(documentBase64);
    isDocumentValid = computedHash === expectedSHA256;
    isDocumentValid = computedHash === expectedSHA256;
  } catch (error) {
    return new VError(error, "compare documents failed");
  }

  const documentValidationResult = await Cache.withCache(conn, ctx, async (cache) => {
    return DocumentValidate.documentValidate(
      isDocumentValid,
      documentId,
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      workflowitemId,
      {
        getWorkflowitem: async (id) => {
          return await WorkflowitemCacheHelper.getWorkflowitem(conn, ctx, projectId, id);
        },
        getUsersForIdentity: async (identity) => {
          return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
        },
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
      },
    );
  });
  if (Result.isErr(documentValidationResult)) {
    return new VError(documentValidationResult, "failed to create event in service");
  }

  const { newEvents } = documentValidationResult;

  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
  }

  return isDocumentValid;
}
