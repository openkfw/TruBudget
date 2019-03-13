import Joi = require("joi");

import * as GroupCreated from "./organization/group_created";
import * as GroupMemberAdded from "./organization/group_member_added";
import * as GroupMemberRemoved from "./organization/group_member_removed";
import * as GroupPermissionGranted from "./organization/group_permissions_granted";
import * as GroupPermissionRevoked from "./organization/group_permissions_revoked";
import * as UserCreated from "./organization/user_created";
import * as GlobalPermissionsGranted from "./workflow/global_permission_granted";
import * as GlobalPermissionsRevoked from "./workflow/global_permission_revoked";
import * as NotificationCreated from "./workflow/notification_created";
import * as NotificationRead from "./workflow/notification_read";
import * as ProjectAssigned from "./workflow/project_assigned";
import * as ProjectClosed from "./workflow/project_closed";
import * as ProjectCreated from "./workflow/project_created";
import * as ProjectPermissionGranted from "./workflow/project_permission_granted";
import * as ProjectPermissionRevoked from "./workflow/project_permission_revoked";
import * as ProjectUpdated from "./workflow/project_updated";
import * as SubprojectAssigned from "./workflow/subproject_assigned";
import * as SubprojectClosed from "./workflow/subproject_closed";
import * as SubprojectCreated from "./workflow/subproject_created";
import * as SubprojectPermissionGranted from "./workflow/subproject_permission_granted";
import * as SubprojectPermissionRevoked from "./workflow/subproject_permission_revoked";
import * as SubprojectUpdated from "./workflow/subproject_updated";
import * as WorkflowitemAssigned from "./workflow/workflowitem_assigned";
import * as WorkflowitemClosed from "./workflow/workflowitem_closed";
import * as WorkflowitemCreated from "./workflow/workflowitem_created";
import * as WorkflowitemPermissionGranted from "./workflow/workflowitem_permission_granted";
import * as WorkflowitemPermissionRevoked from "./workflow/workflowitem_permission_revoked";
import * as WorkflowitemUpdated from "./workflow/workflowitem_updated";

export type BusinessEvent =
  | GlobalPermissionsGranted.Event
  | GlobalPermissionsRevoked.Event
  | GroupCreated.Event
  | GroupMemberAdded.Event
  | GroupMemberRemoved.Event
  | GroupPermissionGranted.Event
  | GroupPermissionRevoked.Event
  | NotificationCreated.Event
  | NotificationRead.Event
  | ProjectAssigned.Event
  | ProjectClosed.Event
  | ProjectCreated.Event
  | ProjectPermissionGranted.Event
  | ProjectPermissionRevoked.Event
  | ProjectUpdated.Event
  | SubprojectAssigned.Event
  | SubprojectClosed.Event
  | SubprojectCreated.Event
  | SubprojectPermissionGranted.Event
  | SubprojectPermissionRevoked.Event
  | SubprojectUpdated.Event
  | UserCreated.Event
  | WorkflowitemAssigned.Event
  | WorkflowitemClosed.Event
  | WorkflowitemCreated.Event
  | WorkflowitemPermissionGranted.Event
  | WorkflowitemPermissionRevoked.Event
  | WorkflowitemUpdated.Event;

export const businessEventSchema = Joi.object({
  type: Joi.string().required(),
  source: Joi.string().required(),
  time: Joi.date()
    .iso()
    .required(),
  publisher: Joi.string().required(),
}).unknown();
