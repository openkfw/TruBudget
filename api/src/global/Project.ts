import Joi = require("joi");

import { Permissions } from "../authz/types";

export interface Project {
  id: string;
  creationUnixTs: string;
  status: "open" | "closed";
  displayName: string;
  assignee?: string;
  description: string;
  amount: string;
  currency: string;
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
  amount: Joi.string().required(),
  currency: Joi.string().required(),
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
