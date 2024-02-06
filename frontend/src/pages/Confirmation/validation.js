import Joi from "@hapi/joi";

const validationForIdNamePermissionneeded = Joi.object({
  id: Joi.string().required(),
  displayName: Joi.string().required(),
  listPermissionsNeeded: Joi.boolean()
});

const validatorForIdName = Joi.object({
  id: Joi.string().required(),
  displayName: Joi.string()
});

const validatorForId = Joi.object({ id: Joi.string().required() });

const schemes = new Map();
schemes
  .set(
    "project.assign",
    Joi.object({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      assignee: Joi.object().concat(validatorForIdName)
    })
  )
  .set(
    "project.createSubproject",
    Joi.object({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      validator: Joi.object().optional(),
      subproject: Joi.object({
        listPermissionsNeeded: Joi.boolean(),
        projectId: Joi.string().required(),
        displayName: Joi.string().required(),
        validator: Joi.object().optional(),
        projectedBudgets: Joi.array()
          .items({
            organization: Joi.string().required(),
            value: Joi.string().required(),
            currencyCode: Joi.string().required()
          })
          .optional(),
        currency: Joi.string().required(),
        description: Joi.string().allow(""),
        workflowitemType: Joi.string().valid("restricted", "general", ""),
        subprojectDisplayName: Joi.string().required()
      })
    })
  )
  .set(
    "subproject.assign",
    Joi.object({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      assignee: Joi.object().concat(validatorForIdName),
      subproject: Joi.object().concat(validationForIdNamePermissionneeded)
    })
  )
  .set(
    "workflowitem.assign",
    Joi.object({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      assignee: Joi.object().concat(validatorForIdName),
      subproject: Joi.object().concat(validationForIdNamePermissionneeded),
      workflowitem: Joi.object().concat(validationForIdNamePermissionneeded)
    })
  )
  .set(
    "subproject.createWorkflowitem",
    Joi.object({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      assignee: Joi.object().concat(validatorForIdName),
      subproject: Joi.object().concat(validationForIdNamePermissionneeded),
      workflowitem: Joi.object({
        listPermissionsNeeded: Joi.boolean(),
        projectId: Joi.string().required(),
        subprojectId: Joi.string().required(),
        displayName: Joi.string().required(),
        amount: Joi.string().allow(""),
        exchangeRate: Joi.number(),
        amountType: Joi.string().required(),
        currency: Joi.string().required(),
        description: Joi.string().allow(""),
        documents: Joi.array().items(
          Joi.alternatives([
            {
              base64: Joi.string().required().allow(""),
              fileName: Joi.string().allow("")
            },
            {
              link: Joi.string()
                .uri()
                .required(),
              fileName: Joi.string().allow("")
            }
          ])
        ),
        status: Joi.string().valid("open"),
        dueDate: Joi.date().allow(null),
        workflowitemType: Joi.string().valid("restricted", "general"),
        projectDisplayName: Joi.string().required(),
        subprojectDisplayName: Joi.string().required(),
        assignee: Joi.string().required(),
        assigneeDisplayName: Joi.string().required(),
        tags: Joi.array().items(Joi.string())
      })
    })
  )
  .set(
    "project.close",
    Joi.object().keys({
      project: Joi.object().concat(validatorForId)
    })
  )
  .set(
    "subproject.close",
    Joi.object().keys({
      project: Joi.object().concat(validatorForId),
      subproject: Joi.object().concat(validatorForId)
    })
  )
  .set(
    "workflowitem.close",
    Joi.object().keys({
      project: Joi.object().concat(validatorForId),
      subproject: Joi.object().concat(validatorForId),
      workflowitem: Joi.object().concat(validatorForId),
      isRejectDialog: Joi.boolean()
    })
  )
  .set(
    "project.intent.grantPermission",
    Joi.object().keys({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      grantee: Joi.object().concat(validatorForIdName),
      intent: Joi.string().required()
    })
  )
  .set(
    "project.intent.revokePermission",
    Joi.object().keys({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      revokee: Joi.object().concat(validatorForIdName),
      intent: Joi.string().required()
    })
  )
  .set(
    "subproject.intent.grantPermission",
    Joi.object().keys({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      subproject: Joi.object().concat(validationForIdNamePermissionneeded),
      grantee: Joi.object().concat(validatorForIdName),
      intent: Joi.string().required()
    })
  )
  .set(
    "subproject.intent.revokePermission",
    Joi.object().keys({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      subproject: Joi.object().concat(validationForIdNamePermissionneeded),
      revokee: Joi.object().concat(validatorForIdName),
      intent: Joi.string().required()
    })
  )
  .set(
    "workflowitem.intent.grantPermission",
    Joi.object().keys({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      subproject: Joi.object().concat(validationForIdNamePermissionneeded),
      workflowitem: Joi.object().concat(validationForIdNamePermissionneeded),
      grantee: Joi.object().concat(validatorForIdName),
      intent: Joi.string().required()
    })
  )
  .set(
    "workflowitem.intent.revokePermission",
    Joi.object().keys({
      project: Joi.object().concat(validationForIdNamePermissionneeded),
      subproject: Joi.object().concat(validationForIdNamePermissionneeded),
      workflowitem: Joi.object().concat(validationForIdNamePermissionneeded),
      revokee: Joi.object().concat(validatorForIdName),
      intent: Joi.string().required()
    })
  )
  .set(
    "global.enableUser",
    Joi.object().keys({
      userId: Joi.string().required()
    })
  )
  .set(
    "global.disableUser",
    Joi.object().keys({
      userId: Joi.string().required()
    })
  );

export const validate = (intent, payload) => {
  const schema = schemes.get(intent);
  if (!schema) throw new Error(`Validation schema for intent ${intent} not implemented yet`);
  const validatePayload = schema.validate(payload, { abortEarly: false }, (error) => error);
  if (!validatePayload.error) {
    return false;
  }
  // eslint-disable-next-line no-console
  console.error("validation error", validatePayload.error);
  // eslint-disable-next-line no-console
  console.log("validation values", validatePayload.value);
  return true;
};
