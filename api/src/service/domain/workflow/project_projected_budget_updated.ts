import Joi = require("joi");
import { VError } from "verror";

import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import { CurrencyCode, currencyCodeSchema, MoneyAmount, moneyAmountSchema } from "./money";
import * as Project from "./project";

type eventTypeType = "project_projected_budget_updated";
const eventType: eventTypeType = "project_projected_budget_updated";

export interface Event {
  type: eventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  organization: string;
  value: MoneyAmount;
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
  value: moneyAmountSchema.required(),
  currencyCode: currencyCodeSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  organization: string,
  value: string,
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
    value,
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
  if (event.type !== "project_projected_budget_updated") {
    throw new VError(`illegal event type: ${event.type}`);
  }

  // An organization may have multiple budgets, but any two budgets of the same
  // organization always have a different currency. The reasoning: if an organization
  // makes two financial commitments in the same currency, they can represented by one
  // commitment with the same currency and the sum of both commitments as its value.
  const projectedBudgets = project.projectedBudgets;
  const targetBudget = projectedBudgets.find(
    x => x.organization === event.organization && x.currencyCode === event.currencyCode,
  );

  if (targetBudget !== undefined) {
    // Update an existing budget:
    targetBudget.value = event.value;
  } else {
    // Add a new budget:
    projectedBudgets.push({
      organization: event.organization,
      currencyCode: event.currencyCode,
      value: event.value,
    });
  }
}
