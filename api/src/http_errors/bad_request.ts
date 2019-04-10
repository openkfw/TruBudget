import Joi = require("joi");
import { VError } from "verror";

import { Ctx } from "../lib/ctx";

interface Info {
  ctx: Ctx;
  requestPath: string;
  validationResult: Joi.ValidationError;
}

export class BadRequest extends VError {
  constructor(info: Info) {
    super({ name: "BadRequest", info }, `invalid request to ${info.requestPath}`);
  }
}
