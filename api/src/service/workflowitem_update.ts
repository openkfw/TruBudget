import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { ServiceUser } from "./domain/organization/service_user";
import { hashDocument, UploadedDocument } from "./domain/workflow/document";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemUpdate from "./domain/workflow/workflowitem_update";
import * as GroupQuery from "./group_query";
import { store } from "./store";

export interface ModificationWithDocumentBodies {
  displayName?: string;
  description?: string;
  amount?: string;
  currency?: string;
  amountType?: "N/A" | "disbursed" | "allocated";
  exchangeRate?: string;
  billingDate?: string;
  dueDate?: string;
  documents?: UploadedDocument[];
  additionalData?: object;
}

export async function updateWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  modification: ModificationWithDocumentBodies,
): Promise<void> {
  const modificationWithDocumentHashes: WorkflowitemUpdate.RequestData = {
    ...modification,
    documents:
      modification.documents === undefined
        ? undefined
        : await Promise.all(modification.documents.map(hashDocument)),
  };

  const result = await Cache.withCache(conn, ctx, async cache => {
    return WorkflowitemUpdate.updateWorkflowitem(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      workflowitemId,
      modificationWithDocumentHashes,
      {
        getWorkflowitem: async id => {
          return cache.getWorkflowitem(projectId, subprojectId, id);
        },
        getUsersForIdentity: async identity => {
          return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
        },
      },
    );
  });

  if (Result.isErr(result)) throw result;

  const { newEvents } = result;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
