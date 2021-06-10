import Joi = require("joi");
import * as Result from "../../../result";
import * as AdditionalData from "../additional_data";
import * as ProvisioningStarted from "./provisioning_started";
import * as ProvisioningEnded from "./provisioning_ended";

export interface SystemInformation {
  provisioningEvents: (ProvisioningStarted.Event | ProvisioningEnded.Event)[];
}

const schema = Joi.object({
  provisioningEvents: Joi.array(),
  additionalData: AdditionalData.schema,
});

export function validate(input: any): Result.Type<SystemInformation> {
  const { error, value } = Joi.validate(input, schema);
  return !error ? value : error;
}
