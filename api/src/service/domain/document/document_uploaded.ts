/* eslint-disable @typescript-eslint/no-explicit-any */
import Joi = require("joi");
import { Ctx } from "lib/ctx";
import logger from "lib/logger";
import { VError } from "verror";
import { config } from "../../../config";
import * as Result from "../../../result";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import { StoredDocument } from "./document";

type DocumentEventTypeType = "document_uploaded";
const documentEventType: DocumentEventTypeType = "document_uploaded";

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

/* eslint-disable @typescript-eslint/no-explicit-any */
export function validate(input: any): Result.Type<Event> {
  const { error, value } = schema.validate(input);
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

  logger.trace({ event }, "Created document_uploaded event");

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

/* eslint-disable @typescript-eslint/no-explicit-any */
export function validateDocument(input: any): Result.Type<StoredDocument> {
  const { error } = documentSchema.validate(input);
  return error === undefined ? (input as StoredDocument) : error;
}

export function createFrom(ctx: Ctx, event: Event): Result.Type<StoredDocument> {
  const initialData = {
    id: event.docId,
    fileName: event.fileName,
    organization: event.organization,
  };

  const documentInfo: StoredDocument = {
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
