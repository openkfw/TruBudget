import Joi = require("joi");
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import * as Project from "./project";
import { ProjectedBudget, projectedBudgetListSchema } from "./projected_budget";
import * as Subproject from "./subproject";

type eventTypeType = "subproject_updated";
const eventType: eventTypeType = "subproject_updated";

interface UpdatedData {
  displayName?: string;
  description?: string;
  assignee?: Identity;
  currency?: string;
  projectedBudgets?: ProjectedBudget[];
  // Additional information (key-value store), e.g. external IDs:
  additionalData?: object;
}

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  subproject: UpdatedData;
}

const updatedDataSchema = Joi.object({
  status: Joi.string().valid("open", "closed"),
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  assignee: Joi.string(),
  currency: Joi.string(),
  projectedBudgets: projectedBudgetListSchema,
  additionalData: AdditionalData.schema,
});

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
  subproject: updatedDataSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  subproject: UpdatedData,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subprojectId,
    subproject,
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
  subproject: Subproject.Subproject,
): Result.Type<Subproject.Subproject> {
  const update = event.subproject;
  if (update.displayName !== undefined) {
    subproject.displayName = update.displayName;
  }
  if (update.description !== undefined) {
    subproject.description = update.description;
  }
  if (update.additionalData) {
    for (const key of Object.keys(update.additionalData)) {
      subproject.additionalData[key] = update.additionalData[key];
    }
  }

  const result = Subproject.validate(subproject);
  if (Result.isErr(result)) {
    return new EventSourcingError(ctx, event, result.message, subproject.id);
  }

  return subproject;
}
