import { encryptWithKey } from "lib/asymmetricCrypto";
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../result";
import * as Cache from "./cache2";
import { StorageServiceClientI } from "./Client_storage_service.h";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import { userExists } from "./domain/organization/user_query";
import * as DocumentGet from "./domain/document/document_get";
import * as DocumentUpload from "./domain/document/document_upload";
import * as DocumentUploaded from "./domain/document/document_uploaded";
import { ServiceUser } from "./domain/organization/service_user";
import * as UserQuery from "./domain/organization/user_query";
import { Document, ResourceMap } from "./domain/ResourceMap";
import * as Workflowitem from "./domain/workflow/workflowitem";
import * as WorkflowitemCreate from "./domain/workflow/workflowitem_create";
import * as WorkflowitemCreated from "./domain/workflow/workflowitem_created";
import * as TypeEvents from "./domain/workflowitem_types/apply_workflowitem_type";
import * as PublicKeyGet from "./public_key_get";
import { store } from "./store";

export { RequestData } from "./domain/workflow/workflowitem_create";

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
        const item = await cache.getWorkflowitem(projectId, subprojectId, workflowitemId);
        return Result.isOk(item);
      },
      userExists: async (userId: string) => {
        return userExists(conn, ctx, serviceUser, userId);
      },
      getUser: async (userId: string) => {
        return UserQuery.getUser(conn, ctx, serviceUser, userId);
      },
      getSubproject: async (projectId: string, subprojectId: string) =>
        cache.getSubproject(projectId, subprojectId),
      applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
        return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
      },
      uploadDocumentToStorageService: (fileName, documentBase64, id) => {
        return DocumentUpload.uploadDocument(
          ctx,
          serviceUser,
          { fileName, documentBase64, id },
          {
            getAllDocumentReferences: async () => {
              return DocumentGet.getAllDocumentReferences({
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
              });
            },
            getPublicKey: async (organization) => {
              return PublicKeyGet.getPublicKey(conn, ctx, organization);
            },
            storeDocument: async (id, name, hash) => {
              return storageServiceClient.uploadObject(id, name, hash);
            },
            encryptWithKey: async (secret, publicKey) => {
              return encryptWithKey(secret, publicKey);
            },
            getUser: (userId) => UserQuery.getUser(conn, ctx, serviceUser, userId),
          },
        );
      },
      getAllDocumentReferences: async () => {
        return DocumentGet.getAllDocumentReferences({
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
