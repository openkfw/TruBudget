import Joi = require("joi");
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import { Permissions, permissionsSchema } from "../permissions";
import Type, { workflowitemTypeSchema } from "../workflowitem_types/types";
import { StoredDocument, storedDocumentSchema } from "./document";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

type eventTypeType = "workflowitem_created";
const eventType: eventTypeType = "workflowitem_created";

interface InitialData {
  id: Workflowitem.Id;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee: Identity;
  amount?: string;
  currency?: string;
  amountType: "N/A" | "disbursed" | "allocated";
  exchangeRate?: string;
  billingDate?: string;
  dueDate?: string;
  documents: StoredDocument[];
  permissions: Permissions;
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
  workflowitemType?: Type;
}

const initialDataSchema = Joi.object({
  id: Workflowitem.idSchema.required(),
  status: Joi.string().valid("open", "closed").required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  assignee: Joi.string(),
  amount: Joi.string(),
  currency: Joi.string(),
  amountType: Joi.valid("N/A", "disbursed", "allocated").required(),
  exchangeRate: Joi.string(),
  billingDate: Joi.date().iso(),
  dueDate: Joi.date().iso().allow(""),
  documents: Joi.array().items(storedDocumentSchema).required(),
  permissions: permissionsSchema.required(),
  additionalData: AdditionalData.schema.required(),
  workflowitemType: workflowitemTypeSchema,
}).options({ stripUnknown: true });

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  workflowitem: InitialData;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitem: initialDataSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitem: InitialData,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subprojectId,
    workflowitem,
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

export function createFrom(ctx: Ctx, event: Event): Result.Type<Workflowitem.Workflowitem> {
  const initialData = event.workflowitem;

  const workflowitem: Workflowitem.Workflowitem = {
    isRedacted: false,
    id: initialData.id,
    subprojectId: event.subprojectId,
    createdAt: event.time,
    displayName: initialData.displayName,
    exchangeRate: initialData.exchangeRate,
    billingDate: initialData.billingDate,
    dueDate: initialData.dueDate,
    amount: initialData.amount,
    currency: initialData.currency,
    amountType: initialData.amountType,
    description: initialData.description,
    status: initialData.status,
    assignee: initialData.assignee,
    documents: initialData.documents,
    permissions: initialData.permissions,
    log: [],
    // Additional information (key-value store), e.g. external IDs:
    additionalData: initialData.additionalData,
    workflowitemType: initialData.workflowitemType,
  };

  return Result.mapErr(
    Workflowitem.validate(workflowitem),
    (error) => new EventSourcingError({ ctx, event, target: workflowitem }, error),
  );
}
