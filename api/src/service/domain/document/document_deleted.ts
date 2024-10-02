import Joi = require("joi");
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import logger from "../../../lib/logger";
import * as Result from "../../../result";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { UserMetadata, userMetadataSchema } from "../metadata";
import { Identity } from "../organization/identity";

import { DeletedDocument } from "./document";

type DocumentDeletedEvent = "document_deleted";
const documentEventType: DocumentDeletedEvent = "document_deleted";

export interface Event {
  type: DocumentDeletedEvent;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  docId: string;
}

export const schema = Joi.object({
  type: Joi.valid(documentEventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  docId: Joi.string().required(),
  metadata: userMetadataSchema,
});

export function validate(input: Partial<Event>): Result.Type<Event> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}

export function createEvent(
  source: string,
  publisher: Identity,
  docId: string,
  time: string = new Date().toISOString(),
  metadata?: UserMetadata,
): Result.Type<Event> {
  const event = {
    type: documentEventType,
    source,
    time,
    publisher,
    docId,
    metadata,
  };

  logger.trace({ event }, "Created document_deleted event");

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

export function validateDocument(input: Partial<DeletedDocument>): Result.Type<DeletedDocument> {
  const { error } = documentSchema.validate(input);
  return error === undefined ? (input as DeletedDocument) : error;
}

export function createFrom(ctx: Ctx, event: Event): Result.Type<DeletedDocument> {
  const initialData = {
    id: event.docId,
  };

  const documentInfo: DeletedDocument = {
    id: initialData.id,
  };

  return Result.mapErr(
    validateDocument(documentInfo),
    (error) => new EventSourcingError({ ctx, event, target: documentInfo }, error),
  );
}
