import * as DocumentShared from './document/documentShared';
import * as DocumentUploaded from './document/documentUploaded';
import * as GlobalPermissionsGranted from './global/globalPermissionGranted';
import * as GlobalPermissionsRevoked from './global/globalPermissionRevoked';
import * as GroupCreated from './group/groupCreated';
import * as GroupMemberAdded from './group/groupMemberAdded';
import * as GroupMemberRemoved from './group/groupMemberRemoved';
import * as NodeDeclined from './node/nodeDeclined';
import * as NodeRegistered from './node/nodeRegistered';
import * as NotificationCreated from './notification/notificationCreated';
import * as NotificationMarkedRead from './notification/notificationMarkedRead';
import * as ProjectAssigned from './project/projectAssigned';
import * as ProjectClosed from './project/projectClosed';
import * as ProjectCreated from './project/projectCreated';
import * as ProjectPermissionsGranted from './project/projectPermissionsGranted';
import * as ProjectPermissionsRevoked from './project/projectPermissionsRevoked';
import * as ProjectProjectedBudgetDeleted from './project/projectProjectedBudgetDeleted';
import * as ProjectProjectedBudgetUpdated from './project/projectProjectedBudgetUpdated';
import * as ProjectUpdated from './project/projectUpdated';
import * as StorageServiceUrlUpdated from './storageServiceUrlUpdated';
import * as SubprojectAssigned from './subproject/subprojectAssigned';
import * as SubprojectClosed from './subproject/subprojectClosed';
import * as SubprojectCreated from './subproject/subprojectCreated';
import * as SubprojectPermissionsGranted from './subproject/subprojectPermissionGranted';
import * as SubprojectPermissionsRevoked from './subproject/subprojectPermissionRevoked';
import * as SubprojectProjectedBudgetDeleted from './subproject/subprojectProjectedBudgetDeleted';
import * as SubprojectProjectedBudgetUpdated from './subproject/subprojectProjectedBudgetUpdated';
import * as SubprojectUpdated from './subproject/subprojectUpdated';
import * as UserCreated from './user/userCreated';
import * as UserDisabled from './user/userDisabled';
import * as UserEnabled from './user/userEnabled';
import * as UserPasswordChanged from './user/userPasswordChanged';
import * as UserPermissionsGranted from './user/userPermissionGranted';
import * as UserPermissionsRevoked from './user/userPermissionRevoked';
import * as DocumentValidated from './workflowitem/documentValidated';
import * as WorkflowitemAssigned from './workflowitem/workflowitemAssigned';
import * as WorkflowitemClosed from './workflowitem/workflowitemClosed';
import * as WorkflowitemCreated from './workflowitem/workflowitemCreated';
import * as WorkflowitemPermissionsGranted from './workflowitem/workflowitemPermissionGranted';
import * as WorkflowitemPermissionsRevoked from './workflowitem/workflowitemPermissionRevoked';
import * as WorkflowitemUpdated from './workflowitem/workflowitemUpdated';
import * as WorkflowitemsReordered from './workflowitem/workflowitemsReordered';

export type ValidationResult = {
  isError: boolean;
  data: any
}

export type isValidable = {
  validate(input: any): ValidationResult
}

interface isValidableMap {
  [eventName: string]: isValidable
}

const createEventParserMap = <T extends isValidableMap>(events: T) => events

export const noValidationRequiredEvents = [
  "peerinfo_saved",
  "provisioning_started",
  "provisioning_ended",
  "public_key_published",
  "public_key_updated"
]

export const eventDoesNotRequireValidation = (event: string): boolean => noValidationRequiredEvents.indexOf(event) === -1 ? false : true


export const EVENT_PARSER_MAP = createEventParserMap({
  project_assigned: ProjectAssigned,
  project_closed: ProjectClosed,
  project_created: ProjectCreated,
  project_permission_granted: ProjectPermissionsGranted,
  project_permission_revoked: ProjectPermissionsRevoked,
  project_projected_budget_deleted: ProjectProjectedBudgetDeleted,
  project_projected_budget_updated: ProjectProjectedBudgetUpdated,
  project_updated: ProjectUpdated,

  subproject_assigned: SubprojectAssigned,
  subproject_closed: SubprojectClosed,
  subproject_created: SubprojectCreated,
  subproject_permission_granted: SubprojectPermissionsGranted,
  subproject_permission_revoked: SubprojectPermissionsRevoked,
  subproject_projected_budget_deleted: SubprojectProjectedBudgetDeleted,
  subproject_projected_budget_updated: SubprojectProjectedBudgetUpdated,
  subproject_updated: SubprojectUpdated,

  user_created: UserCreated,
  user_password_changed: UserPasswordChanged,
  user_enabled: UserEnabled,
  user_disabled: UserDisabled,
  user_permission_granted: UserPermissionsGranted,
  user_permission_revoked: UserPermissionsRevoked,

  workflowitem_assigned: WorkflowitemAssigned,
  workflowitem_closed: WorkflowitemClosed,
  workflowitem_created: WorkflowitemCreated,
  workflowitem_permission_granted: WorkflowitemPermissionsGranted,
  workflowitem_permission_revoked: WorkflowitemPermissionsRevoked,
  workflowitem_updated: WorkflowitemUpdated,
  workflowitem_document_validated: DocumentValidated,
  workflowitems_reordered: WorkflowitemsReordered,

  document_uploaded: DocumentUploaded,
  secret_published: DocumentShared,
  storage_service_url_published: StorageServiceUrlUpdated,
  global_permission_granted: GlobalPermissionsGranted,
  global_permission_revoked: GlobalPermissionsRevoked,
  group_created: GroupCreated,
  group_member_added: GroupMemberAdded,
  group_member_removed: GroupMemberRemoved,
  node_registered: NodeRegistered,
  node_declined: NodeDeclined,
  notification_created: NotificationCreated,
  notification_marked_read: NotificationMarkedRead,

  /**
   * No need to validate
   * peerinfo_saved
   * provisioning_started
   * provisioning_ended
   * public_key_published
   * public_key_updated
   */

}) satisfies isValidableMap;