import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as AdditionalData from "../additional_data";
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
