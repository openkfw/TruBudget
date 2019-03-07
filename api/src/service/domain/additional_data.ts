import Joi = require("joi");

export type AdditionalData = object;

export const schema = Joi.object().unknown();
