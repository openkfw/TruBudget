import Joi = require("joi");
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import { Permissions, permissionsSchema } from "../permissions";
import WorkflowitemType, { workflowitemTypeSchema } from "../workflowitem_types/types";
import { CurrencyCode, currencyCodeSchema } from "./money";
import * as Project from "./project";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";
import * as Subproject from "./subproject";

type EventTypeType = "subproject_created";
const eventType: EventTypeType = "subproject_created";

interface InitialData {
  id: Subproject.Id;
  status: "open" | "closed";
  displayName: string;
  description: string;
  assignee: Identity;
  validator?: Identity;
  workflowitemType?: WorkflowitemType;
  currency: CurrencyCode;
  projectedBudgets: ProjectedBudget[];
  permissions: Permissions;
  // Additional information (key-value store), e.g. external IDs:
  additionalData: object;
}

const initialDataSchema = Joi.object({
  id: Subproject.idSchema.required(),
  status: Joi.string().valid("open", "closed").required(),
  displayName: Joi.string().required(),
  description: Joi.string().allow("").required(),
  assignee: Joi.string().required(),
  validator: Joi.string(),
  workflowitemType: workflowitemTypeSchema,
  currency: currencyCodeSchema.required(),
  projectedBudgets: projectedBudgetListSchema.required(),
  permissions: permissionsSchema.required(),
  additionalData: AdditionalData.schema.required(),
}).options({ stripUnknown: true });

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subproject: InitialData;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subproject: initialDataSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subproject: InitialData,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating subproject_created event");

  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subproject,
    time,
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

export function createFrom(ctx: Ctx, event: Event): Result.Type<Subproject.Subproject> {
  const initialData = event.subproject;

  const subproject: Subproject.Subproject = {
    id: initialData.id,
    projectId: event.projectId,
    createdAt: event.time,
    status: initialData.status,
    displayName: initialData.displayName,
    description: initialData.description,
    assignee: initialData.assignee,
    validator: initialData.validator,
    workflowitemType: initialData.workflowitemType,
    currency: initialData.currency,
    projectedBudgets: initialData.projectedBudgets,
    workflowitemOrdering: [],
    permissions: initialData.permissions,
    log: [],
    additionalData: initialData.additionalData,
  };

  return Result.mapErr(
    Subproject.validate(subproject),
    (error) => new EventSourcingError({ ctx, event, target: subproject }, error),
  );
}
