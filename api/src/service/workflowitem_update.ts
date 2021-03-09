import { VError } from "verror";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { ServiceUser } from "./domain/organization/service_user";
import * as Project from "./domain/workflow/project";
import * as Subproject from "./domain/workflow/subproject";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemUpdate from "./domain/workflow/workflowitem_update";
import * as TypeEvents from "./domain/workflowitem_types/apply_workflowitem_type";
import * as GroupQuery from "./group_query";
import { UploadedDocument } from "./domain/workflow/document";
import * as Nodes from "../network/model/Nodes";
import * as PubKeys from "../network/model/PubKeys";
import { store } from "./store";
import { uploadAsPromised } from "../lib/minio";

export type RequestData = WorkflowitemUpdate.RequestData;

export async function updateWorkflowitem(
  conn: ConnToken,
  ctx: Ctx,
  serviceUser: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  modification: WorkflowitemUpdate.RequestData,
): Promise<Result.Type<void>> {
  const updateWorkflowitemResult = await Cache.withCache(conn, ctx, async (cache) => {
    return WorkflowitemUpdate.updateWorkflowitem(
      ctx,
      serviceUser,
      projectId,
      subprojectId,
      workflowitemId,
      modification,
      {
        getWorkflowitem: async (id) => {
          return cache.getWorkflowitem(projectId, subprojectId, id);
        },
        getUsersForIdentity: async (identity) => {
          return GroupQuery.resolveUsers(conn, ctx, serviceUser, identity);
        },
        applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
          return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
        },
        uploadDocument: async (document: UploadedDocument): Promise<string> => {
          return await uploadAsPromised(document.id, document.base64, { fileName: document.fileName });
        },
        getOrganizations: async () => {
          const nodes = await Nodes.get(conn.multichainClient);
          return nodes;
        },
        getAllUsers: async () => {
          return cache.getUserEvents();
        },
        getAllPublicKeys: async () => {
          return await PubKeys.getAll(conn.multichainClient);
        },
      },
    );
  });
  if (Result.isErr(updateWorkflowitemResult)) {
    return new VError(updateWorkflowitemResult, "update workflowitem failed");
  }
  const { newEvents } = updateWorkflowitemResult;

  for (const event of newEvents) {
    await store(conn, ctx, event);
  }
}
