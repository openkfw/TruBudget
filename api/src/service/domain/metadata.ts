import Joi = require("joi");

export type UserMetadata = {
  externalId: string;
  kid: string | undefined;
};

export const userMetadataSchema = Joi.object({
  externalId: Joi.string(),
  kid: Joi.string().allow(""),
}).options({ stripUnknown: true });
