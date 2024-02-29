import * as Yup from "yup";

Yup.addMethod(Yup.MixedSchema, "oneOfSchemas", (schemas) => {
  return this.test("one-of-schemas", "Not all items in ${path} match one of the allowed schemas", (item) =>
    schemas.some((schema) => schema.isValidSync(item, { strict: true }))
  );
});

const validationForIdNamePermissionneeded = Yup.object({
  id: Yup.string().required(),
  displayName: Yup.string().required(),
  listPermissionsNeeded: Yup.boolean()
});

const validatorForIdName = Yup.object({
  id: Yup.string().required(),
  displayName: Yup.string()
});

const validatorForId = Yup.object({ id: Yup.string().required() });

const schemas = new Map();
schemas
  .set(
    "project.assign",
    Yup.object({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      assignee: Yup.object().concat(validatorForIdName)
    })
  )
  .set(
    "project.createSubproject",
    Yup.object({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      validator: Yup.object().optional(),
      subproject: Yup.object({
        listPermissionsNeeded: Yup.boolean(),
        projectId: Yup.string().required(),
        displayName: Yup.string().required(),
        validator: Yup.object().optional(),
        projectedBudgets: Yup.array()
          .of({
            organization: Yup.string().required(),
            value: Yup.string().required(),
            currencyCode: Yup.string().required()
          })
          .optional(),
        currency: Yup.string().required(),
        description: Yup.string().ensure(),
        workflowitemType: Yup.string().oneOf(["restricted", "general", ""]),
        subprojectDisplayName: Yup.string().required()
      })
    })
  )
  .set(
    "subproject.assign",
    Yup.object({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      assignee: Yup.object().concat(validatorForIdName),
      subproject: Yup.object().concat(validationForIdNamePermissionneeded)
    })
  )
  .set(
    "workflowitem.assign",
    Yup.object({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      assignee: Yup.object().concat(validatorForIdName),
      subproject: Yup.object().concat(validationForIdNamePermissionneeded),
      workflowitem: Yup.object().concat(validationForIdNamePermissionneeded)
    })
  )
  .set(
    "subproject.createWorkflowitem",
    Yup.object({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      assignee: Yup.object().concat(validatorForIdName),
      subproject: Yup.object().concat(validationForIdNamePermissionneeded),
      workflowitem: Yup.object({
        listPermissionsNeeded: Yup.boolean(),
        projectId: Yup.string().required(),
        subprojectId: Yup.string().required(),
        displayName: Yup.string().required(),
        amount: Yup.string().ensure(),
        exchangeRate: Yup.number(),
        amountType: Yup.string().required(),
        currency: Yup.string().required(),
        description: Yup.string().ensure(),
        documents: Yup.array().of(
          Yup.mixed().oneOfSchemas([
            {
              base64: Yup.string().required().ensure(),
              fileName: Yup.string().ensure()
            },
            {
              link: Yup.string().url().required(),
              fileName: Yup.string().ensure()
            }
          ])
        ),
        status: Yup.string().oneOf(["open"]),
        dueDate: Yup.date().nullable(),
        workflowitemType: Yup.string().oneOf(["restricted", "general"]),
        projectDisplayName: Yup.string().required(),
        subprojectDisplayName: Yup.string().required(),
        assignee: Yup.string().required(),
        assigneeDisplayName: Yup.string().required(),
        tags: Yup.array().of(Yup.string())
      })
    })
  )
  .set(
    "project.close",
    Yup.object().shape({
      project: Yup.object().concat(validatorForId)
    })
  )
  .set(
    "subproject.close",
    Yup.object().shape({
      project: Yup.object().concat(validatorForId),
      subproject: Yup.object().concat(validatorForId)
    })
  )
  .set(
    "workflowitem.close",
    Yup.object().shape({
      project: Yup.object().concat(validatorForId),
      subproject: Yup.object().concat(validatorForId),
      workflowitem: Yup.object().concat(validatorForId),
      isRejectDialog: Yup.boolean()
    })
  )
  .set(
    "project.intent.grantPermission",
    Yup.object().shape({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      grantee: Yup.object().concat(validatorForIdName),
      intent: Yup.string().required()
    })
  )
  .set(
    "project.intent.revokePermission",
    Yup.object().shape({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      revokee: Yup.object().concat(validatorForIdName),
      intent: Yup.string().required()
    })
  )
  .set(
    "subproject.intent.grantPermission",
    Yup.object().shape({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      subproject: Yup.object().concat(validationForIdNamePermissionneeded),
      grantee: Yup.object().concat(validatorForIdName),
      intent: Yup.string().required()
    })
  )
  .set(
    "subproject.intent.revokePermission",
    Yup.object().shape({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      subproject: Yup.object().concat(validationForIdNamePermissionneeded),
      revokee: Yup.object().concat(validatorForIdName),
      intent: Yup.string().required()
    })
  )
  .set(
    "workflowitem.intent.grantPermission",
    Yup.object().shape({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      subproject: Yup.object().concat(validationForIdNamePermissionneeded),
      workflowitem: Yup.object().concat(validationForIdNamePermissionneeded),
      grantee: Yup.object().concat(validatorForIdName),
      intent: Yup.string().required()
    })
  )
  .set(
    "workflowitem.intent.revokePermission",
    Yup.object().shape({
      project: Yup.object().concat(validationForIdNamePermissionneeded),
      subproject: Yup.object().concat(validationForIdNamePermissionneeded),
      workflowitem: Yup.object().concat(validationForIdNamePermissionneeded),
      revokee: Yup.object().concat(validatorForIdName),
      intent: Yup.string().required()
    })
  )
  .set(
    "global.enableUser",
    Yup.object().shape({
      userId: Yup.string().required()
    })
  )
  .set(
    "global.disableUser",
    Yup.object().shape({
      userId: Yup.string().required()
    })
  );

export const validate = (intent, payload) => {
  const schema = schemas.get(intent);
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
