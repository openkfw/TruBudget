import Joi = require("joi");

export type Metadata = {
  externalId: string;
  kid?: string | undefined;
};

// TODO joi is not domain object, move it elsewhere
export const metadataSchema = Joi.object({
  externalId: Joi.string(),
  kid: Joi.string().allow(""),
}).options({ stripUnknown: true });
