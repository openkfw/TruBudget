
import * as crypto from "crypto";
import VError = require("verror");
import { ConnToken } from "./conn";
import * as Cache from "./cache2";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as DocumentValidate from "./domain/workflow/document_validate";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as GroupQuery from "./group_query";
import { store } from "./store";


/**
 * Returns true if the given hash matches the given document.
 *
 * @param encoded Base64 encoded document.
 * @param encodedAndHashed SHA-256 hash of the document.
 */
export async function isSameDocument(
  documentBase64: string,
  expectedSHA256: string,
  conn: ConnToken,
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
): Promise<Result.Type<boolean>> {
  const documentValidationResult = await Cache.withCache(conn, ctx, async (cache) => {
    return DocumentValidate.documentValidate(
      ctx,
      issuer,
      projectId,
      subprojectId,
      workflowitemId,
      documentBase64,
      {
        getWorkflowitem: async (id) => {
          return cache.getWorkflowitem(projectId, subprojectId, id);
        },
        getUsersForIdentity: async (identity) => {
          return GroupQuery.resolveUsers(conn, ctx, issuer, identity);
        }
      }
    );
  });
  if (Result.isErr(documentValidationResult)) {
    return new VError(documentValidationResult, "failed to create event in service");
  }

  const { newEvents } = documentValidationResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }

  try {
    const hash = crypto.createHash("sha256");
    hash.update(Buffer.from(documentBase64, "base64"));
    const computedHash = hash.digest("hex");
    return computedHash === expectedSHA256;
  } catch (error) {
    return new VError(error, "compare documents failed");
  }
}
