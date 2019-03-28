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
import deepcopy from "../../../lib/deepcopy";
import logger from "../../../lib/logger";

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
  if (workflowitem.status === "closed") {
    return new EventSourcingError(
      ctx,
      event,
      "updating a closed workflowitem is not allowed",
      workflowitem.id,
    );
  }

  // deep copy and remove undefined fields of object
  const update = deepcopy(event.update);
  const currentDocuments = workflowitem.documents ? deepcopy(workflowitem.documents) : [];

  if (update.documents !== undefined) {
    const currentDocumentIds = currentDocuments.map(x => x.id);
    const newDocuments = update.documents.filter(x => !currentDocumentIds.includes(x.id));
    for (const newDocument of newDocuments) {
      currentDocuments.push(newDocument);
    }
  }

  let nextState: Workflowitem.Workflowitem;

  if (
    (update.amountType && update.amountType === "N/A") ||
    (update.amountType === undefined && workflowitem.amountType === "N/A")
  ) {
    const { amount, currency, exchangeRate, ...workflowitemWOAmounts } = workflowitem;

    nextState = {
      ...workflowitemWOAmounts,
      ...update,
      documents: currentDocuments,
    };
  } else {
    nextState = {
      ...workflowitem,
      ...update,
      documents: currentDocuments,
    };
  }

  const result = Workflowitem.validate(nextState);
  if (Result.isErr(result)) {
    return new EventSourcingError(ctx, event, result.message, workflowitem.id);
  }

  return nextState;
}
