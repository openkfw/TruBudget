import { Ctx } from "../../../lib/ctx";
import * as Result from "../../../result";
import { BusinessEvent } from "../business_event";
import { ServiceUser } from "../organization/service_user";
import * as Workflowitem from "../workflow/workflowitem";
import * as RestrictedWorkflowitem from "./restricted";

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
    case "restricted":
      workflowitemTypeEvents = RestrictedWorkflowitem.createEvents(originEvent, ctx, publisher, workflowitem);
      break;
    default:
      workflowitemTypeEvents = [];
      break;
  }

  return workflowitemTypeEvents;
};
