import Joi = require("joi");

export interface ProvisioningState {
  isProvisioned: Boolean;
  message: string;
}

export const provisioningStateSchema = Joi.object().keys({
  isProvisioned: Joi.boolean().required(),
  message: Joi.string().required(),
});
