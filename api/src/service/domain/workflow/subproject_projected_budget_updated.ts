import Joi = require("joi");
import { VError } from "verror";
import * as Result from "../../../result";
import { Identity } from "../organization/identity";
import { CurrencyCode, currencyCodeSchema, MoneyAmount, moneyAmountSchema } from "./money";
import * as Project from "./project";
import * as Subproject from "./subproject";

type EventTypeType = "subproject_projected_budget_updated";
const eventType: EventTypeType = "subproject_projected_budget_updated";

export interface Event {
  type: EventTypeType;
  source: string;
  time: string; // ISO timestamp
  publisher: Identity;
  projectId: Project.Id;
  subprojectId: Subproject.Id;
  organization: string;
  value: MoneyAmount;
  currencyCode: CurrencyCode;
}

export const schema = Joi.object({
  type: Joi.valid(eventType).required(),
  source: Joi.string().allow("").required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
  projectId: Project.idSchema.required(),
  subprojectId: Subproject.idSchema.required(),
  organization: Joi.string().required(),
  value: moneyAmountSchema.required(),
  currencyCode: currencyCodeSchema.required(),
});

export function createEvent(
  source: string,
  publisher: Identity,
  projectId: Project.Id,
  subprojectId: Subproject.Id,
  organization: string,
  value: string,
  currencyCode: CurrencyCode,
  time: string = new Date().toISOString(),
): Result.Type<Event> {
  const event = {
    type: eventType,
    source,
    time,
    publisher,
    projectId,
    subprojectId,
    organization,
    value,
    currencyCode,
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
 * Applies the event to the given subproject, or returns an error.
 *
 * When an error is returned (or thrown), any already applied modifications are
 * discarded.
 *
 * This function is not expected to validate its changes; instead, the modified
 * subproject is automatically validated when obtained using
 * `subproject_eventsourcing.ts`:`newSubprojectFromEvent`.
 */
export function mutate(subproject: Subproject.Subproject, event: Event): Result.Type<void> {
  if (event.type !== "subproject_projected_budget_updated") {
    return new VError(`illegal event type: ${event.type}`);
  }

  // An organization may have multiple budgets, but any two budgets of the same
  // organization always have a different currency. The reasoning: if an organization
  // makes two financial commitments in the same currency, they can represented by one
  // commitment with the same currency and the sum of both commitments as its value.
  const projectedBudgets = subproject.projectedBudgets;
  const targetBudget = projectedBudgets.find(
    (x) => x.organization === event.organization && x.currencyCode === event.currencyCode,
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
