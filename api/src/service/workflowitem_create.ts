import { VError } from "verror";
import { encryptWithKey } from "../lib/asymmetricCrypto";
import { Ctx } from "../lib/ctx";
import * as Result from "../result";
import * as Cache from "./cache2";
import { StorageServiceClientI } from "./Client_storage_service.h";
import { ConnToken } from "./conn";
import { BusinessEvent } from "./domain/business_event";
import * as DocumentGet from "./domain/document/document_get";
import * as DocumentUpload from "./domain/document/document_upload";
import * as DocumentUploaded from "./domain/document/document_uploaded";
import { ServiceUser } from "./domain/organization/service_user";
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
  storageServiceClient: StorageServiceClientI, //TODO: make optional
  ctx: Ctx,
  serviceUser: ServiceUser,
  requestData: WorkflowitemCreate.RequestData,
): Promise<Result.Type<ResourceMap>> {
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
      getSubproject: async (projectId: string, subprojectId: string) =>
        await cache.getSubproject(projectId, subprojectId),
      applyWorkflowitemType: (event: BusinessEvent, workflowitem: Workflowitem.Workflowitem) => {
        return TypeEvents.applyWorkflowitemType(event, ctx, serviceUser, workflowitem);
      },
      uploadDocumentToStorageService: (fileName, documentBase64, id) => {
        return DocumentUpload.uploadDocument(
          ctx,
          serviceUser,
          { fileName, documentBase64, id },
          {
            getAllDocuments: async () => {
              return await DocumentGet.getAllDocuments(ctx, {
                getDocumentsEvents: async () => {
                  return await cache.getDocumentUploadedEvents();
                },
                getOffchainDocumentsEvents: async () => {
                  return await cache.getOffchainDocumentsEvents();
                },
              });
            },
            getPublicKey: async (organization) => {
              return PublicKeyGet.getPublicKey(conn, ctx, organization);
            },
            storeDocument: async (id, hash) => {
              return await storageServiceClient.uploadObject(id, fileName, hash);
            },
            encryptWithKey: async (secret, publicKey) => {
              return encryptWithKey(secret, publicKey);
            },
          },
        );
      },
      getAllDocuments: async () => {
        return await DocumentGet.getAllDocuments(ctx, {
          getDocumentsEvents: async () => {
            return cache.getDocumentUploadedEvents();
          },
          getOffchainDocumentsEvents: async () => {
            return cache.getOffchainDocumentsEvents();
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
  const documents: Document[] = [];
  for (const event of newEvents) {
    await store(conn, ctx, event);
    if (isCreateEvent(event)) {
      const workflowitemEvent: WorkflowitemCreated.Event = event;
      projectId = workflowitemEvent.projectId;
      subprojectId = workflowitemEvent.subprojectId;
      workflowitemId = workflowitemEvent.workflowitem.id;
    }
    if (isDocumentEvent(event)) {
      const documentEvent: DocumentUploaded.Event = event;
      const document: Document = {
        fileName: documentEvent.fileName,
        id: documentEvent.docId,
      };
      documents.push(document);
    }
  }

  const resourceIds: ResourceMap = {
    project: { id: projectId },
    subproject: { id: subprojectId },
    workflowitem: { id: workflowitemId, documents },
  };

  return resourceIds;
}

function isCreateEvent(businessEvent: BusinessEvent): businessEvent is WorkflowitemCreated.Event {
  return businessEvent.type === "workflowitem_created";
}
function isDocumentEvent(businessEvent: BusinessEvent): businessEvent is DocumentUploaded.Event {
  return businessEvent.type === "document_uploaded";
}
