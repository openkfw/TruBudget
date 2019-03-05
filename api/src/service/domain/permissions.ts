import Joi = require("joi");

import Intent, { allIntents } from "../../authz/intents";
import { Identity } from "./organization/identity";

export type Permissions = { [key in Intent]?: Identity[] };

export const permissionsSchema = Joi.object().pattern(
  Joi.valid(allIntents),
  Joi.array().items(Joi.string()),
);
