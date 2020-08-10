# Workflowitem Types

This directory contains the files to create typed workflowitems. Thus the workflowitem performs additional events according to its type.


## Add workflowitem type

To add an additional workflowitem type add a field with the name of the type to `types.ts`. Also add an additional case in `apply_workflowitem_type.ts` to create additional events.

```typescript
export const applyWorkflowitemType = (
  originEvent: BusinessEvent,
  ctx: Ctx,
  publisher: ServiceUser,
  workflowitem: Workflowitem.Workflowitem,
): Result.Type<BusinessEvent[]> => {
  let workflowitemTypeEvents: Result.Type<BusinessEvent[]>;

  switch (workflowitem.workflowitemType) {
    case "general":
      workflowitemTypeEvents = [];
      break;
  // Add additional case here
    
    default:
      workflowitemTypeEvents = [];
      break;
  }

  return workflowitemTypeEvents;
};
```

Then create your own file with the workflowitem type's name, e.g. `restricted.ts`, to define the logic of your workflowitem type.

The function `applyWorkflowitemType` is called by `workflowitem_assign.ts`, `workflowitem_close.ts`, `workflowitem_create.ts` and `workflowitem_update.ts` from the domain layer. Thus the created events are performed in addition to their general behaviour.
