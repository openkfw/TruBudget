import Joi = require("joi");
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import * as Project from "./project";
import deepcopy from "../../../lib/deepcopy";

type eventTypeType = "project_updated";
const eventType: eventTypeType = "project_updated";

/**
 * We only support updating very few fields with this command. For example,
 * `projectedBudgets` is not included here, because the semantics of updating it this
 * way are not quite clear, plus we want such a change to be explicit by causing a
 * dedicated event.
 */
export interface Modification {
  displayName?: string;
  description?: string;
  thumbnail?: string;
  additionalData?: object;
}

export const modificationSchema = Joi.object({
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  thumbnail: Joi.string().allow(""),
  additionalData: AdditionalData.schema,
}).or("displayName", "description", "thumbnail", "additionalData");

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
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
  update: modificationSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  modification: Modification,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    publisher,
    time,
    projectId,
    update: modification,
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
  project: Project.Project,
): Result.Type<Project.Project> {
  if (project.status !== "open") {
    return new EventSourcingError(
      { ctx, event, target: project },
      `a project may only be updated if its status is "open"`,
    );
  }

  const update = event.update;

  const additionalData = project.additionalData;
  if (update.additionalData) {
    for (const key of Object.keys(update.additionalData)) {
      additionalData[key] = update.additionalData[key];
    }
  }

  const nextState = {
    ...project,
    // Only updated if defined in the `update`:
    ...(update.displayName !== undefined && { displayName: update.displayName }),
    // Only updated if defined in the `update`:
    ...(update.description !== undefined && { description: update.description }),
    // Only updated if defined in the `update`:
    ...(update.thumbnail !== undefined && { thumbnail: update.thumbnail }),
    additionalData,
  };

  return Result.mapErr(
    Project.validate(nextState),
    error => new EventSourcingError({ ctx, event, target: project }, error),
  );
}
