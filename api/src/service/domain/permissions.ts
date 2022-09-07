import Joi = require("joi");
import Intent, { allIntents, ExposableIntent } from "../../authz/intents";
import { Identity } from "./organization/identity";

export type Permissions = { [key in Intent]?: Identity[] };
export type ExposablePermissions = { [key in ExposableIntent]?: Identity[] };

export const permissionsSchema = Joi.object().pattern(
  Joi.valid(...allIntents),
  Joi.array().items(Joi.string()),
);

/**
 * Removes permissions which should not be returned to the user
 * @param permissions
 * @param filter
 */
export const getExposablePermissions = (
  permissions: Permissions,
  filter: Array<"project.close" | "subproject.close" | "workflowitem.close">,
): ExposablePermissions => {
  return Object.keys(permissions).reduce((filteredPerm, intent) => {
    if (!(filter as string[]).includes(intent)) {
      filteredPerm[intent] = permissions[intent];
    }
    return filteredPerm;
  }, {});
};
