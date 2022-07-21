import Joi = require("joi");
import { VError } from "verror";
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import { Identity } from "../organization/identity";
import * as Project from "./project";

type EventTypeType = "project_updated";
const eventType: EventTypeType = "project_updated";

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
  tags?: string[];
}

export const modificationSchema = Joi.object({
  displayName: Joi.string(),
  description: Joi.string().allow(""),
  thumbnail: Joi.string().allow(""),
  additionalData: AdditionalData.schema,
  tags: Joi.array().items(Project.tagsSchema),
}).or("displayName", "description", "thumbnail", "additionalData", "tags");

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  update: Modification;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
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
): Result.Type<Event> {
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
    return new VError(validationResult, `not a valid ${eventType} event`);
  }
  return event;
}

export function validate(input): Result.Type<Event> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}

/**
 * Applies the event to the given project, or returns an error.
 *
 * When an error is returned (or thrown), any already applied modifications are
 * discarded.
 *
 * This function is not expected to validate its changes; instead, the modified project
 * is automatically validated when obtained using
 * `project_eventsourcing.ts`:`newProjectFromEvent`.
 */
export function mutate(project: Project.Project, event: Event): Result.Type<void> {
  if (event.type !== "project_updated") {
    return new VError(`illegal event type: ${event.type}`);
  }

  if (project.status !== "open") {
    return new VError('a project may only be updated if its status is "open"');
  }

  const update = event.update;

  ["displayName", "description", "thumbnail", "tags"].forEach((propname) => {
    if (update[propname] !== undefined) {
      project[propname] = update[propname];
    }
  });

  if (update.additionalData) {
    for (const key of Object.keys(update.additionalData)) {
      project.additionalData[key] = update.additionalData[key];
    }
  }
}
