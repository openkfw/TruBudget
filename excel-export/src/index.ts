import Joi = require("joi");

import * as api from "./api";
import { writeXLS } from "./excel";

const axios = require("axios");

const URL_PREFIX = "/api";

const projectSchema = Joi.object({
  //   id: idSchema.required(),
  id: Joi.string().required(),
  createdAt: Joi.date()
    .iso()
    .required(),
  status: Joi.string()
    .valid("open", "closed")
    .required(),
  displayName: Joi.string().required(),
  description: Joi.string()
    .allow("")
    .required(),
  assignee: Joi.string(),
  thumbnail: Joi.string().allow(""),
  //   projectedBudgets: projectedBudgetListSchema.required(),
  projectedBudgets: Joi.any().required(),
  //   permissions: permissionsSchema.required(),
  permissions: Joi.any().required(),
  log: Joi.array()
    .required()
    .items(Joi.any()),
  // .items(projectTraceEventSchema),
  //   additionalData: AdditionalData.schema.required(),
  additionalData: Joi.any().required(),
});

/*
 * Deal with the environment:
 */

const port: number = (process.env.PORT && parseInt(process.env.PORT, 10)) || 8080;

const jwtSecret: string = process.env.JWT_SECRET || "asdf";
const rootSecret: string = process.env.ROOT_SECRET || "asdf";
const organization: string = process.env.ORGANIZATION || "test";
const organizationVaultSecret: string = process.env.ORGANIZATION_VAULT_SECRET || "asdf";

const SWAGGER_BASEPATH = process.env.SWAGGER_BASEPATH || "/";

const host: string = process.env.API_HOST || "localhost";
axios.defaults.baseURL = `http://${host}:${port}/api`;
axios.defaults.timeout = 10000;

const DEFAULT_API_VERSION = "1.0";

// let token = "";

axios.defaults.transformRequest = [
  (data, headers) => {
    if (typeof data === "object") {
      return {
        apiVersion: DEFAULT_API_VERSION,
        data: { ...data },
      };
    } else {
      return data;
    }
  },
  ...axios.defaults.transformRequest,
];

api.checkReadyness(axios);
writeXLS(axios);
