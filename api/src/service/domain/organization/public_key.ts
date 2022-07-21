import Joi = require("joi");

import * as Result from "../../../result";

export type Organization = string;
export type PublicKeyBase64 = string;

export interface PublicKey {
  organization: Organization;
  publicKey: PublicKeyBase64;
}

const schema = Joi.object({
  organization: Joi.string().required(),
  publicKey: Joi.string().required(),
});

export function validate(input): Result.Type<PublicKey> {
  const { error, value } = schema.validate(input);
  return !error ? value : error;
}
