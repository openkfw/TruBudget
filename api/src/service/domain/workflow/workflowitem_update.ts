import isEqual = require("lodash.isequal");
import { VError } from "verror";

import { hostPort, minioEndPoint, organization as thisOrganization } from "../../../config";
import { Ctx } from "../../../lib/ctx";
import * as Nodes from "../../../network/model/Nodes";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { InvalidCommand } from "../errors/invalid_command";
import { NotAuthorized } from "../errors/not_authorized";
import { NotFound } from "../errors/not_found";
import { Identity } from "../organization/identity";
import { ServiceUser } from "../organization/service_user";
import * as UserRecord from "../organization/user_record";
import { hashDocuments, StoredDocument, UploadedDocument } from "./document";
import * as DocumentSecretPublished from "./document_secret_published";
import * as NotificationCreated from "./notification_created";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as WorkflowitemDocumentUploaded from "./workflowitem_document_uploaded";
import * as WorkflowitemEventSourcing from "./workflowitem_eventsourcing";
import * as WorkflowitemUpdated from "./workflowitem_updated";
import { PublicKey } from "../../../network/model/PubKeys";
import Intent from "../../../authz/intents";
import { encryptWithKey } from "../../../lib/asymmetricCrypto";
import logger from "../../../lib/logger";

export interface RequestData {
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

export type EventData = WorkflowitemUpdated.Modification;
export const requestDataSchema = WorkflowitemUpdated.modificationSchema;

interface NodeInfoAddress {
  organization: string;
}
interface Repository {
  getWorkflowitem(workflowitemId: Workflowitem.Id): Promise<Result.Type<Workflowitem.Workflowitem>>;
  getUsersForIdentity(identity: Identity): Promise<Result.Type<UserRecord.Id[]>>;
  applyWorkflowitemType(
    event: BusinessEvent,
    workflowitem: Workflowitem.Workflowitem,
  ): Result.Type<BusinessEvent[]>;
  uploadDocument(document: UploadedDocument): Promise<string>;
  getOrganizations(): Promise<Nodes.NodeInfo[]>;
  getAllUsers(): Promise<any[]>;
  getPublicKeyOfOrganization(organization: string): Promise<Result.Type<PublicKey>>;
}

export async function updateWorkflowitem(
  ctx: Ctx,
  issuer: ServiceUser,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  modification: RequestData,
  repository: Repository,
): Promise<Result.Type<{ newEvents: BusinessEvent[]; workflowitem: Workflowitem.Workflowitem }>> {
  const workflowitem = await repository.getWorkflowitem(workflowitemId);
  if (Result.isErr(workflowitem)) {
    return new NotFound(ctx, "workflowitem", workflowitemId);
  }

  const newDocuments: StoredDocument[] = [];
  if (modification.documents !== undefined) {
    const hashDocumentsResult = await hashDocuments(modification.documents);
    if (Result.isErr(hashDocumentsResult)) {
      return new VError(hashDocumentsResult, "failed to hash documents");
    }
    newDocuments.push(...hashDocumentsResult);
  }

  const modificationWithDocumentHashes: EventData = {
    ...modification,
    documents: newDocuments.length <= 0 ? undefined : newDocuments,
  };

  const newEvent = WorkflowitemUpdated.createEvent(
    ctx.source,
    issuer.id,
    projectId,
    subprojectId,
    workflowitemId,
    modificationWithDocumentHashes,
  );
  if (Result.isErr(newEvent)) {
    return new VError(newEvent, "cannot update workflowitem");
  }

  // Check authorization (if not root):
  if (issuer.id !== "root") {
    const intent = "workflowitem.update";
    if (!Workflowitem.permits(workflowitem, issuer, [intent])) {
      return new NotAuthorized({ ctx, userId: issuer.id, intent, target: workflowitem });
    }
  }

  // Check that the new event is indeed valid:
  const updatedWorkflowitemResult = WorkflowitemEventSourcing.newWorkflowitemFromEvent(
    ctx,
    workflowitem,
    newEvent,
  );
  if (Result.isErr(updatedWorkflowitemResult)) {
    return new VError(updatedWorkflowitemResult, "new event valditation failed");
  }
  const updatedWorkflowitem = updatedWorkflowitemResult;

  // Only emit the event if it causes any changes:
  if (isEqualIgnoringLog(workflowitem, updatedWorkflowitemResult)) {
    return { newEvents: [], workflowitem };
  }

  // Create notification events:
  let notifications: Result.Type<NotificationCreated.Event[]> = [];
  if (workflowitem.assignee !== undefined) {
    const recipientsResult = await repository.getUsersForIdentity(workflowitem.assignee);
    if (Result.isErr(recipientsResult)) {
      return new VError(recipientsResult, `fetch users for ${workflowitem.assignee} failed`);
    }
    notifications = recipientsResult.reduce((notifications, recipient) => {
      // The issuer doesn't receive a notification:
      if (recipient !== issuer.id) {
        const notification = NotificationCreated.createEvent(
          ctx.source,
          issuer.id,
          recipient,
          newEvent,
          projectId,
        );
        if (Result.isErr(notification)) {
          return new VError(notification, "failed to create notification event");
        }
        notifications.push(notification);
      }
      return notifications;
    }, [] as NotificationCreated.Event[]);
  }
  if (Result.isErr(notifications)) {
    return new VError(notifications, "failed to create notification events");
  }

  // Handle new documents
  let newDocumentUploadedEventsResult: Result.Type<WorkflowitemDocumentUploaded.Event>[] = [];
  if (newEvent.update.documents && newEvent.update.documents.length > 0) {
    const { documents } = newEvent.update;
    if (modification.documents === undefined) {
      // Documents of newEvent are created from documents given by the requestData(modification).
      // If documents exist in newEvent there has to be the same amount in modification
      // The documents in modification have to be used to find out the base64 string since it may not be part of the update event itself
      return new Error("Assertion: This is a bug.");
    }
    const modDocuments = modification.documents;
    newDocumentUploadedEventsResult = documents.map((d, i) => {
      const docToUpload: UploadedDocument = {
        base64: modDocuments[i].base64,
        fileName: modDocuments[i].fileName ? modDocuments[i].fileName : "unknown-file.pdf",
        id: d.documentId,
      };

      const workflowitemEvent = WorkflowitemDocumentUploaded.createEvent(
        ctx.source,
        issuer.id,
        projectId,
        subprojectId,
        workflowitemId,
        docToUpload,
      );
      if (Result.isErr(workflowitemEvent)) {
        return new VError(workflowitemEvent, "failed to create event");
      }

      // Check that the event is valid:
      const uploadedDocumentResult = WorkflowitemDocumentUploaded.createFrom(
        ctx,
        workflowitemEvent,
      );
      if (Result.isErr(uploadedDocumentResult)) {
        return new InvalidCommand(ctx, workflowitemEvent, [uploadedDocumentResult]);
      }
      return workflowitemEvent;
    });
  }

  const newDocumentUploadedEvents: WorkflowitemDocumentUploaded.Event[] = [];
  const documentSecretPublishedEvents: DocumentSecretPublished.Event[] = [];
  const organizationsWithPermission = await getOrganizationsWithPermission(
    "workflowitem.view",
    workflowitem,
    repository,
  );
  for (const result of newDocumentUploadedEventsResult) {
    if (Result.isErr(result)) {
      return result;
    }
    const { document } = result as WorkflowitemDocumentUploaded.Event;

    if (minioEndPoint) {
      // Upload document and get secret for future access
      //TODO Result
      const secret = await repository.uploadDocument(document);
      logger.info("Uploaded Document with access secret: ", secret);
      for (const organization of organizationsWithPermission) {
        //Encrypt secret with public key of organizations with permissions
        const publicKeyResult = await repository.getPublicKeyOfOrganization(organization);
        if (Result.isErr(publicKeyResult)) {
          return new VError(publicKeyResult, "failed to get public key");
        }
        const publicKey: PublicKey = publicKeyResult;
        logger.info("Encrypt secret with public key...");
        const encryptedSecret = encryptWithKey(secret, publicKey);
        const newDocumentSecretPublishedEvent = DocumentSecretPublished.createEvent(
          ctx.source,
          issuer.id,
          organization,
          document.id,
          encryptedSecret,
        );
        if (Result.isErr(newDocumentSecretPublishedEvent)) {
          return new VError(
            newDocumentSecretPublishedEvent,
            `cannot create document_secret_published event for ${organization} and document ${document.id}`,
          );
        }

        // Check if event is indeed valid

        documentSecretPublishedEvents.push(newDocumentSecretPublishedEvent);
      }

      newDocumentUploadedEvents.push({
        ...result,
        document: { ...document, base64: "", url: hostPort },
      } as WorkflowitemDocumentUploaded.Event);
    } else {
      newDocumentUploadedEvents.push(result);
    }
  }

  const workflowitemTypeEventsResult = repository.applyWorkflowitemType(newEvent, workflowitem);

  if (Result.isErr(workflowitemTypeEventsResult)) {
    return new VError(workflowitemTypeEventsResult, "failed to apply workflowitem type");
  }
  const workflowitemTypeEvents = workflowitemTypeEventsResult;

  return {
    newEvents: [
      newEvent,
      ...newDocumentUploadedEvents,
      ...documentSecretPublishedEvents,
      ...notifications,
      ...workflowitemTypeEvents,
    ],
    workflowitem: updatedWorkflowitem,
  };
}

async function getOrganizationsWithPermission(
  intent: Intent,
  workflowitem: Workflowitem.Workflowitem,
  repository: Repository,
) {
  const identitiesWithPermission = workflowitem.permissions[intent];
  // list all organizations with view rights
  const allUsers = await repository.getAllUsers();
  const organizationsWithPermissions = allUsers
    .filter((user) => identitiesWithPermission?.includes(user?.user?.id))
    .map((user) => user?.user?.organization)
    .filter((orgName, index, self) => self.indexOf(orgName) === index);

  // remove current organization from list
  // TODO uncomment it again to ensure that no secret is generated for own orga
  // const index = organizationsWithPermissions.indexOf(thisOrganization);
  // if (index > -1) {
  //   organizationsWithPermissions.splice(index, 1);
  // }
  return organizationsWithPermissions;
}

function isEqualIgnoringLog(
  workflowitemA: Workflowitem.Workflowitem,
  workflowitemB: Workflowitem.Workflowitem,
): boolean {
  const { log: logA, ...a } = workflowitemA;
  const { log: logB, ...b } = workflowitemB;
  return isEqual(a, b);
}
