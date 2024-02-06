import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { DocumentOrExternalLinkReference, DocumentReference, ExternalLinkReference, documentReferenceSchema } from "../document/document";
import { Identity } from "../organization/identity";
import { conversionRateSchema, moneyAmountSchema } from "./money";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import { UserMetadata, userMetadataSchema } from "../metadata";
import { safeStringSchema } from "../../../lib/joiValidation";

type EventTypeType = "workflowitem_updated";
const eventType: EventTypeType = "workflowitem_updated";

export interface Modification {
  displayName?: string;
  description?: string;
  amount?: string;
  currency?: string;
  amountType?: "N/A" | "disbursed" | "allocated";
  exchangeRate?: string;
  billingDate?: string;
  dueDate?: string;
  documents?: DocumentOrExternalLinkReference[];
  additionalData?: object;
  tags?: string[];
}

export const modificationSchema = Joi.object({
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  exchangeRate: conversionRateSchema,
  billingDate: Joi.date().iso(),
  amount: moneyAmountSchema,
  currency: Joi.string(),
  amountType: Joi.valid("N/A", "disbursed", "allocated"),
  dueDate: Joi.date().iso().allow(""),
  documents: Joi.array().items(documentReferenceSchema),
  additionalData: AdditionalData.schema,
  tags: Joi.array().items(safeStringSchema),
});

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  workflowitemId: Workflowitem.Id;
  update: Modification;
  metadata?: UserMetadata;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitemId: Workflowitem.idSchema.required(),
  update: modificationSchema.required(),
  metadata: userMetadataSchema,
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  update: Modification,
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  logger.trace("Creating workflowitem_updated event");

  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subprojectId,
    workflowitemId,
    update,
    time,
    metadata,
  };

  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    return new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input): Result.Type<Event> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}

/**
 * Applies the event to the given workflowitem, or returns an error.
 *
 * When an error is returned (or thrown), any already applied modifications are
 * discarded.
 *
 * This function is not expected to validate its changes; instead, the modified
 * workflowitem is automatically validated when obtained using
 * `workflowitem_eventsourcing.ts`:`newWorkflowitemFromEvent`.
 */
export function mutate(workflowitem: Workflowitem.Workflowitem, event: Event): Result.Type<void> {
  if (event.type !== "workflowitem_updated") {
    return new VError(`illegal event type: ${event.type}`);
  }

  if (workflowitem.status !== "open") {
    return new VError('a workflowitem may only be updated if its status is "open"');
  }

  updateProps(workflowitem, event.update);
  updateAdditionalData(workflowitem, event.update.additionalData);
  const updatedDocumentResult = updateDocuments(workflowitem, event.update.documents);
  if (Result.isErr(updatedDocumentResult)) {
    return new VError(updatedDocumentResult, "update documents failed");
  }

  // Setting the amount type to "N/A" removes fields that
  // only make sense if amount type is _not_ "N/A":
  if (event.update.amountType === "N/A") {
    delete workflowitem.amount;
    delete workflowitem.currency;
    delete workflowitem.exchangeRate;
    delete workflowitem.billingDate;
  }
}

function updateProps(workflowitem: Workflowitem.Workflowitem, update: Modification): void {
  [
    "displayName",
    "description",
    "amountType",
    "amount",
    "currency",
    "exchangeRate",
    "billingDate",
    "dueDate",
    "tags",
  ].forEach((propname) => {
    if (update[propname] !== undefined) {
      workflowitem[propname] = update[propname];
    }
  });
}

function updateAdditionalData(
  workflowitem: Workflowitem.Workflowitem,
  additionalData?: object,
): void {
  if (additionalData === undefined) {
    return;
  }

  for (const key of Object.keys(additionalData)) {
    workflowitem.additionalData[key] = additionalData[key];
  }
}

function updateDocuments(
  workflowitem: Workflowitem.Workflowitem,
  documents?: DocumentOrExternalLinkReference[],
): Result.Type<void> {
  if (documents === undefined) {
    return;
  }
  // Existing documents are never overwritten. They are only allowed in the update if
  // they are equal to their existing record.
  for (const document of documents) {
    const existingDocument = workflowitem.documents.find(
      (x) => x.id === document.id && document.hasOwnProperty("hash"),
    ) as DocumentReference | undefined;
    const existingExternalLink = workflowitem.documents.find(
      (x) => x.id === document.id && document.hasOwnProperty("link"),
    ) as ExternalLinkReference | undefined;
    if (existingDocument === undefined && existingExternalLink === undefined) {
      // This is a new document.
      workflowitem.documents.push(document);
    } else if (existingExternalLink) {
      // We already know a document with the same ID.
      const justExternalLink = document as ExternalLinkReference;
      if (existingExternalLink && existingExternalLink.link !== justExternalLink.link) {
        return new VError(
          `cannot update document external link ${document.id}, ` +
            "as changing existing documents is not allowed",
        );
      }
    } else {
      // We already know a document with the same ID.
      const justDocument = document as DocumentReference;
      if (existingDocument && existingDocument.hash !== justDocument.hash) {
        return new VError(
          `cannot update document ${document.id}, ` +
            "as changing existing documents is not allowed",
        );
      }
    }
  }
}
