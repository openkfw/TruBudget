import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { Identity } from "../organization/identity";
import { StoredDocument, storedDocumentSchema } from "./document";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

type eventTypeType = "workflowitem_updated";
const eventType: eventTypeType = "workflowitem_updated";

export interface Modification {
  displayName?: string;
  description?: string;
  amount?: string;
  currency?: string;
  amountType?: "N/A" | "disbursed" | "allocated";
  exchangeRate?: string;
  billingDate?: string;
  dueDate?: string;
  documents?: StoredDocument[];
  additionalData?: object;
}

export const modificationSchema = Joi.object({
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
): Result.Type<Event> {
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
    return new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
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
    throw new VError(`illegal event type: ${event.type}`);
  }

  if (workflowitem.status !== "open") {
    return new VError(`a workflowitem may only be updated if its status is "open"`);
  }

  const update = event.update;

  [
    "displayName",
    "description",
    "amount",
    "currency",
    "amountType",
    "billingDate",
    "dueDate",
  ].forEach(propname => {
    if (update[propname] !== undefined) {
      workflowitem[propname] = update[propname];
    }
  });

  if (update.additionalData) {
    for (const key of Object.keys(update.additionalData)) {
      workflowitem.additionalData[key] = update.additionalData[key];
    }
  }

  if (update.documents) {
    // Any document with an ID that's already in use is silently ignored.
    const currentIds = workflowitem.documents.map(x => x.id);
    const newDocuments = update.documents.filter(x => !currentIds.includes(x.id));
    workflowitem.documents.push(...newDocuments);
  }

  // Setting the amount type to "N/A" removes fields that
  // only make sense if amount type is _not_ "N/A":
  if (update.amountType === "N/A") {
    delete workflowitem.amount;
    delete workflowitem.currency;
    delete workflowitem.exchangeRate;
    delete workflowitem.billingDate;
  }
}
