import Joi = require("joi");
import logger from "lib/logger";
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as Workflowitem from "./workflowitem";

type EventTypeType = "workflowitem_snapshot_published";
const eventType: EventTypeType = "workflowitem_snapshot_published";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: string;
  subprojectId: string;
  workflowitem: Workflowitem.Workflowitem;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Joi.string().required(),
  subprojectId: Joi.string().required(),
  workflowitem: Workflowitem.schema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: string,
  subprojectId: string,
  workflowitem: Workflowitem.Workflowitem,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  logger.trace("Creating workflowitem_snapshot_published event");
  const event = {
    type: eventType,
    source: source,
    publisher: publisher,
    time: time,
    projectId: projectId,
    subprojectId: subprojectId,
    workflowitem: workflowitem,
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
