import Joi = require("joi");
import { VError } from "verror";

import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { EventSourcingError } from "../errors/event_sourcing_error";
import { Identity } from "../organization/identity";
import { CurrencyCode, currencyCodeSchema } from "./money";
import * as Project from "./project";

type eventTypeType = "project_projected_budget_deleted";
const eventType: eventTypeType = "project_projected_budget_deleted";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  organization: string;
  currencyCode: CurrencyCode;
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
  organization: Joi.string().required(),
  currencyCode: currencyCodeSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  organization: string,
  currencyCode: CurrencyCode,
  time: string = new Date().toISOString(),
): Event {
  const event = {
    type: eventType,
    source,
    time,
    publisher,
    projectId,
    organization,
    currencyCode,
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
  // An organization may have multiple budgets, but any two budgets of the same
  // organization always have a different currency. The reasoning: if an organization
  // makes two financial commitments in the same currency, they can represented by one
  // commitment with the same currency and the sum of both commitments as its value.
  const projectedBudgets = project.projectedBudgets.filter(
    x => x.organization === event.organization && x.currencyCode === event.currencyCode,
  );
  project = { ...project, projectedBudgets };

  const result = Project.validate(project);
  if (Result.isErr(result)) {
    return new EventSourcingError(ctx, event, result.message, project.id);
  }

  return project;
}
