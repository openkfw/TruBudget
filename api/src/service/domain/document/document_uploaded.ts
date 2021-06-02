import Joi = require("joi");
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import { Ctx } from "../../../lib/ctx";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { GenericDocument } from "./document";
import { config } from "../../../config";

type DocumentEventTypeType = "document_uploaded";
const documentEventType: DocumentEventTypeType = "document_uploaded";
export interface Document extends GenericDocument {
  id: string;
  fileName: string;
  organization: string;
  organizationUrl: string;
}

export interface Event {
  type: DocumentEventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  docId: string;
  fileName: string;
  organization: string;
}

export const schema = Joi.object({
  type: Joi.valid(documentEventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  docId: Joi.string().required(),
  fileName: Joi.string().required(),
  organization: Joi.string().required(),
});

export function validate(input: any): Result.Type<Event> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}

export function createEvent(
  source: string,
  publisher: Identity,
  docId: string,
  fileName: string,
  organization: string,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: documentEventType,
    source,
    time,
    publisher,
    docId,
    fileName,
    organization,
  };

  const validationResult = validate(event);
  if (Result.isErr(validationResult)) {
    return new VError(validationResult, `not a valid ${documentEventType} event`);
  }

  return event;
}

const documentSchema = Joi.object().keys({
  id: Joi.string().required(),
  fileName: Joi.string().required(),
  organization: Joi.string().required(),
  organizationUrl: Joi.string().allow("").required(),
});

export function validateDocument(input: any): Result.Type<Document> {
  const { error } = Joi.validate(input, documentSchema);
  return error === null ? (input as Document) : error;
}

export function createFrom(ctx: Ctx, event: Event): Result.Type<Document> {
  const initialData = {
    id: event.docId,
    fileName: event.fileName,
    organization: event.organization,
  };

  const documentInfo: Document = {
    id: initialData.id,
    fileName: initialData.fileName,
    organization: initialData.organization,
    organizationUrl: `${config.storageService.externalUrl}`,
  };

  return Result.mapErr(
    validateDocument(documentInfo),
    (error) => new EventSourcingError({ ctx, event, target: documentInfo }, error),
  );
}
