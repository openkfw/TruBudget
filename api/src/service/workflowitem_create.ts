import { VError } from "verror";

import { encryptWithKey } from "../lib/asymmetricCrypto";
import { Ctx } from "../lib/ctx";
import logger from "../lib/logger";
import * as Result from "../result";

import * as Cache from "./cache2";
import { StorageServiceClientI } from "./Client_storage_service.h";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import * as DocumentGet from "./domain/document/document_get";
import * as DocumentUpload from "./domain/document/document_upload";
import * as DocumentUploaded from "./domain/document/document_uploaded";
import { ServiceUser } from "./domain/organization/service_user";
import { userExists } from "./domain/organization/user_query";
import * as UserQuery from "./domain/organization/user_query";
import { Document, ResourceMap } from "./domain/ResourceMap";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemCreate from "./domain/workflow/workflowitem_create";
import * as WorkflowitemCreated from "./domain/workflow/workflowitem_created";
import * as WorkflowitemSnapshotPublish from "./domain/workflow/workflowitem_snapshot_publish";
import * as TypeEvents from "./domain/workflowitem_types/apply_workflowitem_type";
import * as ProjectCacheHelper from "./project_cache_helper";
import * as PublicKeyGet from "./public_key_get";
import { store } from "./store";
import * as SubprojectCacheHelper from "./subproject_cache_helper";
import * as WorkflowitemCacheHelper from "./workflowitem_cache_helper";

export { RequestData } from "./domain/workflow/workflowitem_create";

export interface Service {
  createWorkflowitem(
    ctx: Ctx,
    user: ServiceUser,
    createRequest: WorkflowitemCreate.RequestData,
  ): Promise<Result.Type<ResourceMap>>;
}

export async function createWorkflowitem(
  conn: ConnToken,
  storageServiceClient: StorageServiceClientI,
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: WorkflowitemCreate.RequestData,
): Promise<Result.Type<ResourceMap>> {
  logger.debug({ req: requestData }, "Creating workflowitem");
  const newEventResult = await Cache.withCache(conn, ctx, (cache) => {
    return WorkflowitemCreate.createWorkflowitem(ctx, serviceUser, requestData, {
      workflowitemExists: async (
        projectId: string,
        subprojectId: string,
        workflowitemId: string,
      ) => {
        const item = await WorkflowitemCacheHelper.getWorkflowitem(
          conn,
          ctx,
          projectId,
          workflowitemId,
        );
        return Result.isOk(item);
      },
      userExists: async (userId: string) => {
        return userExists(conn, ctx, serviceUser, userId);
      },
      getUser: async (userId: string) => {
        return UserQuery.getUser(conn, ctx, serviceUser, userId);
      },
      getSubproject: async (projectId: string, subprojectId: string) => {
        return await SubprojectCacheHelper.getSubproject(conn, ctx, projectId, subprojectId);
      },
      applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
        return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
      },
      uploadDocumentToStorageService: async (file: DocumentUpload.File) => {
        return await DocumentUpload.uploadDocument(ctx, serviceUser, file, {
          getAllDocumentReferences: async () => {
            return DocumentGet.getAllDocumentReferences({
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
            });
          },
          getPublicKey: async (organization) => {
            return PublicKeyGet.getPublicKey(conn, ctx, organization);
          },
          storeDocument: async (file: DocumentUpload.File) => {
            return storageServiceClient.uploadObject(file);
          },
          encryptWithKey: async (secret, publicKey) => {
            return encryptWithKey(secret, publicKey);
          },
          getUser: (userId) => UserQuery.getUser(conn, ctx, serviceUser, userId),
        });
      },
      getAllDocumentReferences: async () => {
        return DocumentGet.getAllDocumentReferences({
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
        });
      },
    });
  });

  if (Result.isErr(newEventResult)) {
    return new VError(newEventResult, "create workflowitem failed");
  }
  const newEvents = newEventResult;

  let projectId = "";
  let subprojectId = "";
  let workflowitemId = "";
  let document: Document;
  const documents: Document[] = [];
  for (const event of newEvents) {
    await store(conn, ctx, event, serviceUser.address);
    switch (event.type) {
      case "workflowitem_created":
        const workflowitemEvent: WorkflowitemCreated.Event = event;
        projectId = workflowitemEvent.projectId;
        subprojectId = workflowitemEvent.subprojectId;
        workflowitemId = workflowitemEvent.workflowitem.id;
        const { eventData } = await WorkflowitemSnapshotPublish.publishWorkflowitemSnapshot(
          ctx,
          conn,
          projectId,
          workflowitemId,
          serviceUser,
        );
        if (Result.isErr(eventData)) {
          return new VError(eventData, "create workflowitem snapshot failed");
        }
        const publishEvent = eventData;
        await store(conn, ctx, publishEvent, serviceUser.address);
        break;

      case "document_uploaded":
        const documentUploadedEvent: DocumentUploaded.Event = event;
        document = {
          fileName: documentUploadedEvent.fileName,
          id: documentUploadedEvent.docId,
        };
        documents.push(document);
        break;

      default:
        break;
    }
  }

  const resourceIds: ResourceMap = {
    project: { id: projectId },
    subproject: { id: subprojectId },
    workflowitem: { id: workflowitemId, documents },
  };

  return resourceIds;
}
