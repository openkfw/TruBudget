import Joi = require("joi");
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import { UserMetadata, userMetadataSchema } from "../metadata";

type EventTypeType = "workflowitem_assigned";
const eventType: EventTypeType = "workflowitem_assigned";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  workflowitemId: Workflowitem.Id;
  assignee: Identity;
  metadata?: UserMetadata;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitemId: Workflowitem.idSchema.required(),
  assignee: Joi.string().required(),
  metadata: userMetadataSchema,
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  assignee: Identity,
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    time,
    publisher,
    projectId,
    subprojectId,
    workflowitemId,
    assignee,
    metadata,
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
  if (event.type !== "workflowitem_assigned") {
    return new VError(`illegal event type: ${event.type}`);
  }

  // Since we cannot have any side effects here, the existance of a user is expected to
  // be validated before the event is produced.
  workflowitem.assignee = event.assignee;
}
