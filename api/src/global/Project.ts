import Joi = require("joi");

import { Permissions } from "../authz/types";

interface ProjectedBudget {
  organization: string;
  value: string;
  currencyCode: string;
}

export interface Project {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  assignee?: string;
  description: string;
  projectedBudgets: ProjectedBudget[];
  thumbnail: string;
  permissions: Permissions;
}

const schema = Joi.object().keys({
  id: Joi.string()
    .max(32)
    .required(),
  creationUnixTs: Joi.date()
    .timestamp("unix")
    .required(),
  status: Joi.string()
    .valid("open", "closed")
    .required(),
  displayName: Joi.string().required(),
  assignee: Joi.string(),
  description: Joi.string()
    .allow("")
    .required(),
  projectedBudgets: Joi.array().items(
    Joi.object().keys({
      organization: Joi.string(),
      value: Joi.string(),
      currencyCode: Joi.string(),
    }),
  ),
  thumbnail: Joi.string()
    .allow("")
    .required(),
  permissions: Joi.object()
    .pattern(/.*/, Joi.array().items(Joi.string()))
    .required(),
});

export function validateProject(input: Project): Project {
  const { error, value } = Joi.validate(input, schema);
  if (error === null) {
    return value;
  } else {
    throw error;
  }
}
