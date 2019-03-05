import Joi = require("joi");

export interface ProjectedBudget {
  organization: string;
  value: string;
  currencyCode: string;
}

export const projectedBudgetSchema = Joi.object({
  organization: Joi.string().required(),
  value: Joi.string().required(),
  currencyCode: Joi.string().required(),
});

export const projectedBudgetListSchema = Joi.array().items(projectedBudgetSchema);
