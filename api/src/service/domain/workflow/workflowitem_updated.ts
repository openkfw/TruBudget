import Joi = require("joi");
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import { StoredDocument, storedDocumentSchema } from "./document";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

type eventTypeType = "workflowitem_updated";
const eventType: eventTypeType = "workflowitem_updated";

interface Modification {
  displayName?: string;
  description?: string;
  amount?: string;
  currency?: string;
  amountType?: "N/A" | "disbursed" | "allocated";
  exchangeRate?: string;
  billingDate?: string;
  dueDate?: string;
  documents?: StoredDocument[];
  additionalData?: {};
}

const modificationSchema = Joi.object({
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  amount: Joi.string(),
  currency: Joi.string(),
  amountType: Joi.valid("N/A", "disbursed", "allocated"),
  exchangeRate: Joi.string(),
  billingDate: Joi.date().iso(),
  dueDate: Joi.date().iso(),
  documents: Joi.array().items(storedDocumentSchema),
  additionalData: AdditionalData.schema,
});

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  workflowitemId: Workflowitem.Id;
  update: Modification;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string()
    .allow("")
    .required(),
  time: Joi.date()
    .iso()
    .required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitemId: Workflowitem.idSchema.required(),
  update: modificationSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  update: Modification,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subprojectId,
    workflowitemId,
    update,
    time,
  };

  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    throw new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}

export function apply(
  ctx: Ctx,
  event: Event,
  workflowitem: Workflowitem.Workflowitem,
): Result.Type<Workflowitem.Workflowitem> {
  const update = event.update;

  if (update.displayName !== undefined) {
    workflowitem.displayName = update.displayName;
  }
  if (update.description !== undefined) {
    workflowitem.description = update.description;
  }
  if (update.amount !== undefined) {
    workflowitem.amount = update.amount;
  }
  if (update.currency !== undefined) {
    workflowitem.currency = update.currency;
  }
  if (update.amountType !== undefined) {
    workflowitem.amountType = update.amountType;
  }
  if (update.exchangeRate !== undefined) {
    workflowitem.exchangeRate = update.exchangeRate;
  }
  if (update.billingDate !== undefined) {
    workflowitem.billingDate = update.billingDate;
  }
  if (update.dueDate !== undefined) {
    workflowitem.dueDate = update.dueDate;
  }
  if (update.documents !== undefined) {
    // Attention, funny behavior: if a document has an ID that is already present in the
    // documents list IT IS SILENTLY IGNORED:
    const currentDocuments = workflowitem.documents || [];
    const currentDocumentIds = currentDocuments.map(x => x.id);
    workflowitem.documents = update.documents
      .filter(x => currentDocumentIds.includes(x.id))
      .concat(currentDocuments);
  }
  if (update.additionalData) {
    for (const key of Object.keys(update.additionalData)) {
      workflowitem.additionalData[key] = update.additionalData[key];
    }
  }

  const result = Workflowitem.validate(workflowitem);
  if (Result.isErr(result)) {
    return new EventSourcingError(ctx, event, result.message, workflowitem.id);
  }

  return workflowitem;
}
