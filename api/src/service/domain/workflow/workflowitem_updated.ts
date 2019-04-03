import Joi = require("joi");
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import deepcopy from "../../../lib/deepcopy";
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

export function apply(
  ctx: Ctx,
  event: Event,
  workflowitem: Workflowitem.Workflowitem,
): Result.Type<Workflowitem.Workflowitem> {
  if (workflowitem.status !== "open") {
    return new EventSourcingError(
      { ctx, event, target: workflowitem },
      `a workflowitem may only be updated if its status is "open"`,
    );
  }

  // deep copy and remove undefined fields of object
  const update = event.update;

  const nextState = {
    ...workflowitem,
    // Only updated if defined in the `update`:
    ...(update.displayName !== undefined && { displayName: update.displayName }),
    ...(update.description !== undefined && { description: update.description }),
    ...(update.amount !== undefined && { amount: update.amount }),
    ...(update.currency !== undefined && { currency: update.currency }),
    ...(update.amountType !== undefined && { amountType: update.amountType }),
    ...(update.billingDate !== undefined && { billingDate: update.billingDate }),
    ...(update.dueDate !== undefined && { dueDate: update.dueDate }),
    additionalData: updateAdditionalData(
      deepcopy(workflowitem.additionalData),
      update.additionalData,
    ),
    documents: updateDocuments(deepcopy(workflowitem.documents), update.documents),
  };

  // Setting the amount type to "N/A" removes fields that
  // only make sense if amount type is _not_ "N/A":
  if (update.amountType === "N/A") {
    delete nextState.amount;
    delete nextState.currency;
    delete nextState.exchangeRate;
    delete nextState.billingDate;
  }

  return Result.mapErr(
    Workflowitem.validate(nextState),
    error => new EventSourcingError({ ctx, event, target: workflowitem }, error),
  );
}

function updateAdditionalData(additionalData: object, update?: object): object {
  if (update) {
    for (const key of Object.keys(update)) {
      additionalData[key] = update[key];
    }
  }
  return additionalData;
}

function updateDocuments(documents: StoredDocument[], update?: StoredDocument[]): StoredDocument[] {
  if (update) {
    // Any document with an ID that's already in use is silently ignored!
    const currentIds = documents.map(x => x.id);
    return update.filter(x => !currentIds.includes(x.id)).concat(documents);
  }
  return documents;
}
