import Joi from "@hapi/joi";

const validationForIdNamePermissionneeded = Joi.object({
  id: Joi.string().required(),
  displayName: Joi.string().required(),
  listPermissionsNeeded: Joi.boolean(),
});

const validatorForIdName = Joi.object({
  id: Joi.string().required(),
  displayName: Joi.string(),
});

const validatorForId = Joi.object({ id: Joi.string().required() });


const schemes = new Map();
schemes
  .set("project.assign", Joi.object({
    project: Joi.object().concat(validationForIdNamePermissionneeded),
    assignee: Joi.object().concat(validatorForIdName),
  }))
  .set("subproject.assign", Joi.object({
    project: Joi.object().concat(validationForIdNamePermissionneeded),
    assignee: Joi.object().concat(validatorForIdName),
    subproject: Joi.object().concat(validationForIdNamePermissionneeded),
  }))
  .set("workflowitem.assign", Joi.object({
    project: Joi.object().concat(validationForIdNamePermissionneeded),
    assignee: Joi.object().concat(validatorForIdName),
    subproject: Joi.object().concat(validationForIdNamePermissionneeded),
    workflowitem: Joi.object().concat(validationForIdNamePermissionneeded),
  }))
  .set("project.close", Joi.object().keys({
    project: Joi.object().concat(validatorForId)
  }))
  .set("subproject.close", Joi.object().keys({
    project: Joi.object().concat(validatorForId),
    subproject: Joi.object().concat(validatorForId)
  }))
  .set("workflowitem.close", Joi.object().keys({
    project: Joi.object().concat(validatorForId),
    subproject: Joi.object().concat(validatorForId),
    workflowitem: Joi.object().concat(validatorForId)
  }))
  .set("project.intent.grantPermission", Joi.object().keys({
    project: Joi.object().concat(validationForIdNamePermissionneeded),
    grantee: Joi.object().concat(validatorForIdName),
    intent: Joi.string().required()
  }))
  .set("project.intent.revokePermission", Joi.object().keys({
    project: Joi.object().concat(validationForIdNamePermissionneeded),
    revokee: Joi.object().concat(validatorForIdName),
    intent: Joi.string().required()
  }))
  .set("subproject.intent.grantPermission", Joi.object().keys({
    project: Joi.object().concat(validationForIdNamePermissionneeded),
    subproject: Joi.object().concat(validationForIdNamePermissionneeded),
    grantee: Joi.object().concat(validatorForIdName),
    intent: Joi.string().required()
  }))
  .set("subproject.intent.revokePermission", Joi.object().keys({
    project: Joi.object().concat(validationForIdNamePermissionneeded),
    subproject: Joi.object().concat(validationForIdNamePermissionneeded),
    revokee: Joi.object().concat(validatorForIdName),
    intent: Joi.string().required()
  }))
  .set("workflowitem.intent.grantPermission", Joi.object().keys({
    project: Joi.object().concat(validationForIdNamePermissionneeded),
    subproject: Joi.object().concat(validationForIdNamePermissionneeded),
    workflowitem: Joi.object().concat(validationForIdNamePermissionneeded),
    grantee: Joi.object().concat(validatorForIdName),
    intent: Joi.string().required()
  }))
  .set("workflowitem.intent.revokePermission", Joi.object().keys({
    project: Joi.object().concat(validationForIdNamePermissionneeded),
    subproject: Joi.object().concat(validationForIdNamePermissionneeded),
    workflowitem: Joi.object().concat(validationForIdNamePermissionneeded),
    revokee: Joi.object().concat(validatorForIdName),
    intent: Joi.string().required()
  }))
  .set("global.enableUser", Joi.object().keys({
    userId: Joi.string().required()
  }))
  .set("global.disableUser", Joi.object().keys({
    userId: Joi.string().required()
  }))


export const validate = (intent, payload) => {
  const schema = schemes.get(intent);
  const validatePayload = schema.validate(payload, {abortEarly: false}, (error, values) => error);
  if(!validatePayload.error) {
    return false;
  }
  console.error('validation error', validatePayload.error);
  console.log('validation values', validatePayload.value);
  return true;
}
