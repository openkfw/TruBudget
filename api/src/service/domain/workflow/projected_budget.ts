import Joi = require("joi");

import { CurrencyCode, currencyCodeSchema, MoneyAmount, moneyAmountSchema } from "./money";

export interface ProjectedBudget {
  organization: string;
  value: MoneyAmount;
  currencyCode: CurrencyCode;
}

export const projectedBudgetSchema = Joi.object({
  organization: Joi.string().required(),
  value: moneyAmountSchema.required(),
  currencyCode: currencyCodeSchema.required(),
});

export const projectedBudgetListSchema = Joi.array().items(projectedBudgetSchema);
