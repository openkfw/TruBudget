import Joi = require("joi");
import { VError } from "verror";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { Identity } from "../organization/identity";
import * as Project from "./project";
import { projectedBudgetListSchema } from "./projected_budget";
import * as Subproject from "./subproject";

type EventTypeType = "subproject_updated";
const eventType: EventTypeType = "subproject_updated";

export interface UpdatedData {
  displayName?: string;
  description?: string;
  additionalData?: object;
}

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  update: UpdatedData;
}

export const updatedDataSchema = Joi.object({
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
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  update: updatedDataSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  update: UpdatedData,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subprojectId,
    update,
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

/**
 * Applies the event to the given subproject, or returns an error.
 *
 * When an error is returned (or thrown), any already applied modifications are
 * discarded.
 *
 * This function is not expected to validate its changes; instead, the modified
 * subproject is automatically validated when obtained using
 * `subproject_eventsourcing.ts`:`newSubprojectFromEvent`.
 */
export function mutate(subproject: Subproject.Subproject, event: Event): Result.Type<void> {
  if (event.type !== "subproject_updated") {
    return new VError(`illegal event type: ${event.type}`);
  }

  if (subproject.status !== "open") {
    return new VError('a subproject may only be updated if its status is "open"');
  }

  const update = event.update;

  ["displayName", "description"].forEach((propname) => {
    if (update[propname] !== undefined) {
      subproject[propname] = update[propname];
    }
  });

  if (update.additionalData) {
    for (const key of Object.keys(update.additionalData)) {
      subproject.additionalData[key] = update.additionalData[key];
    }
  }
}
