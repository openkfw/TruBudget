import Joi = require("joi");
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import * as WorkflowitemDocument from "../workflow/document";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import { Ctx } from "../../../lib/ctx";
import { EventSourcingError } from "../errors/event_sourcing_error";

type eventTypeType = "workflowitem_document_uploaded";
const eventType: eventTypeType = "workflowitem_document_uploaded";

type InitialData = WorkflowitemDocument.UploadedDocument;

const initialDataSchema = WorkflowitemDocument.uploadedDocumentSchema.options({
  stripUnknown: true,
});

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  workflowitemId: Workflowitem.Id;
  document: InitialData;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  workflowitemId: Workflowitem.idSchema.required(),
  document: initialDataSchema.required(),
});

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  workflowitemId: Workflowitem.Id,
  document: InitialData,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    publisher,
    projectId,
    subprojectId,
    workflowitemId,
    document,
    time,
  };

  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    return new VError(validationResult, `not a valid ${eventType} event`);
  }

  return event;
}

export function createFrom(
  ctx: Ctx,
  event: Event,
): Result.Type<WorkflowitemDocument.UploadedDocument> {
  const initialData = event.document;

  const workflowitemDocument: WorkflowitemDocument.UploadedDocument = {
    id: initialData.id,
    base64: initialData.base64,
    fileName: initialData.fileName,
  };

  return Result.mapErr(
    WorkflowitemDocument.validate(workflowitemDocument),
    (error) => new EventSourcingError({ ctx, event, target: workflowitemDocument }, error),
  );
}
