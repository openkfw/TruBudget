import Joi = require("joi");
import Intent, { allIntents, ExposableIntent } from "../../authz/intents";
import { Identity } from "./organization/identity";

export type Permissions = { [key in Intent]?: Identity[] };
export type ExposablePermissions = { [key in ExposableIntent]?: Identity[] };

export const permissionsSchema = Joi.object().pattern(
  Joi.valid(allIntents),
  Joi.array().items(Joi.string()),
);

export const getExposablePermissions = (
  permissions: Permissions,
  filter: Array<"project.close" | "subproject.close" | "workflowitem.close">,
): ExposablePermissions => {
  const filterablePermissions = filter as string[];
  return Object.keys(permissions).reduce((filteredPerm, intent) => {
    if (!filterablePermissions.includes(intent)) {
      filteredPerm[intent] = permissions[intent];
    }
    return filteredPerm;
  }, {});
};
