import Joi = require("joi");

import * as GroupCreated from "./organization/group_created";
import * as GroupMemberAdded from "./organization/group_member_added";
import * as GroupMemberRemoved from "./organization/group_member_removed";
import * as GroupPermissionGranted from "./organization/group_permissions_granted";
import * as GroupPermissionRevoked from "./organization/group_permissions_revoked";
import * as UserCreated from "./organization/user_created";
import * as UserPasswordChanged from "./organization/user_password_changed";
import * as UserEnabled from "./organization/user_enabled";
import * as UserDisabled from "./organization/user_disabled";
import * as UserPermissionGranted from "./organization/user_permission_granted";
import * as UserPermissionRevoked from "./organization/user_permission_revoked";
import * as GlobalPermissionsGranted from "./workflow/global_permission_granted";
import * as GlobalPermissionsRevoked from "./workflow/global_permission_revoked";
import * as NotificationCreated from "./workflow/notification_created";
import * as NotificationMarkedRead from "./workflow/notification_marked_read";
import * as ProjectAssigned from "./workflow/project_assigned";
import * as ProjectClosed from "./workflow/project_closed";
import * as ProjectCreated from "./workflow/project_created";
import * as ProjectPermissionGranted from "./workflow/project_permission_granted";
import * as ProjectPermissionRevoked from "./workflow/project_permission_revoked";
import * as ProjectProjectedBudgetDeleted from "./workflow/project_projected_budget_deleted";
import * as ProjectProjectedBudgetUpdated from "./workflow/project_projected_budget_updated";
import * as ProjectUpdated from "./workflow/project_updated";
import * as SubprojectAssigned from "./workflow/subproject_assigned";
import * as SubprojectClosed from "./workflow/subproject_closed";
import * as SubprojectCreated from "./workflow/subproject_created";
import * as SubprojectPermissionGranted from "./workflow/subproject_permission_granted";
import * as SubprojectPermissionRevoked from "./workflow/subproject_permission_revoked";
import * as SubprojectProjectedBudgetDeleted from "./workflow/subproject_projected_budget_deleted";
import * as SubprojectProjectedBudgetUpdated from "./workflow/subproject_projected_budget_updated";
import * as SubprojectUpdated from "./workflow/subproject_updated";
import * as WorkflowitemAssigned from "./workflow/workflowitem_assigned";
import * as WorkflowitemClosed from "./workflow/workflowitem_closed";
import * as WorkflowitemCreated from "./workflow/workflowitem_created";
import * as WorkflowitemPermissionGranted from "./workflow/workflowitem_permission_granted";
import * as WorkflowitemPermissionRevoked from "./workflow/workflowitem_permission_revoked";
import * as WorkflowitemUpdated from "./workflow/workflowitem_updated";
import * as WorkflowitemsReordered from "./workflow/workflowitems_reordered";
import * as WorkflowitemDocumentUploaded from "./workflow/workflowitem_document_uploaded";

export type BusinessEvent =
  | GlobalPermissionsGranted.Event
  | GlobalPermissionsRevoked.Event
  | GroupCreated.Event
  | GroupMemberAdded.Event
  | GroupMemberRemoved.Event
  | GroupPermissionGranted.Event
  | GroupPermissionRevoked.Event
  | NotificationCreated.Event
  | NotificationMarkedRead.Event
  | ProjectAssigned.Event
  | ProjectClosed.Event
  | ProjectCreated.Event
  | ProjectPermissionGranted.Event
  | ProjectPermissionRevoked.Event
  | ProjectProjectedBudgetDeleted.Event
  | ProjectProjectedBudgetUpdated.Event
  | ProjectUpdated.Event
  | SubprojectAssigned.Event
  | SubprojectClosed.Event
  | SubprojectCreated.Event
  | WorkflowitemsReordered.Event
  | SubprojectPermissionGranted.Event
  | SubprojectPermissionRevoked.Event
  | SubprojectProjectedBudgetDeleted.Event
  | SubprojectProjectedBudgetUpdated.Event
  | SubprojectUpdated.Event
  | UserCreated.Event
  | UserPasswordChanged.Event
  | UserEnabled.Event
  | UserDisabled.Event
  | UserPermissionGranted.Event
  | UserPermissionRevoked.Event
  | WorkflowitemAssigned.Event
  | WorkflowitemClosed.Event
  | WorkflowitemCreated.Event
  | WorkflowitemPermissionGranted.Event
  | WorkflowitemPermissionRevoked.Event
  | WorkflowitemUpdated.Event
  | WorkflowitemDocumentUploaded.Event;

export const businessEventSchema = Joi.object({
  type: Joi.string().required(),
  source: Joi.string().required(),
  time: Joi.date().iso().required(),
  publisher: Joi.string().required(),
}).unknown();
