import { AxiosRequestConfig } from "axios";
import "module-alias/register";
import { AugmentedFastifyInstance } from "types";
import getValidConfig from "./config";
import * as GlobalPermissionsGrantAllAPI from "./global_permissions_grant_all";
import * as GlobalPermissionsListAPI from "./global_permissions_list";
import * as GlobalPermissionGrantAPI from "./global_permission_grant";
import * as GlobalPermissionRevokeAPI from "./global_permission_revoke";
import * as GroupCreateAPI from "./group_create";
import * as GroupListAPI from "./group_list";
import * as GroupMemberAddAPI from "./group_member_add";
import * as GroupMemberRemoveAPI from "./group_member_remove";
import * as GroupPermissionsListAPI from "./group_permissions_list";
import { registerRoutes } from "./httpd/router";
import { createBasicApp } from "./httpd/server";
import deepcopy from "./lib/deepcopy";
import logger from "./lib/logger";
import { isReady } from "./lib/readiness";
import timeout from "./lib/timeout";
import { checkNodes } from "./network/controller/logNodes";
import { registerNode } from "./network/controller/registerNode";
import * as NotificationCountAPI from "./notification_count";
import * as NotificationListAPI from "./notification_list";
import * as NotificationMarkReadAPI from "./notification_mark_read";
import { ensureOrganizationStream } from "./organization/organization";
import * as ProjectAssignAPI from "./project_assign";
import * as ProjectProjectedBudgetDeleteAPI from "./project_budget_delete_projected";
import * as ProjectProjectedBudgetUpdateAPI from "./project_budget_update_projected";
import * as ProjectCloseAPI from "./project_close";
import * as ProjectCreateAPI from "./project_create";
import * as ProjectListAPI from "./project_list";
import * as ProjectPermissionsListAPI from "./project_permissions_list";
import * as ProjectPermissionGrantAPI from "./project_permission_grant";
import * as ProjectPermissionRevokeAPI from "./project_permission_revoke";
import * as ProjectUpdateAPI from "./project_update";
import * as ProjectViewDetailsAPI from "./project_view_details";
import * as ProjectViewHistoryAPI from "./project_view_history";
import * as ProvisioningEndAPI from "./provisioning_end";
import * as ProvisioningStatusAPI from "./provisioning_get";
import * as ProvisioningStartAPI from "./provisioning_start";
import * as Result from "./result";
import * as Multichain from "./service";
import * as Cache from "./service/cache2";
import StorageServiceClient from "./service/Client_storage_service";
import * as DocumentValidationService from "./service/document_validation";
import * as GroupQueryService from "./service/domain/organization/group_query";
import * as UserQueryService from "./service/domain/organization/user_query";
import * as GlobalPermissionsGetService from "./service/global_permissions_get";
import * as GlobalPermissionGrantService from "./service/global_permission_grant";
import * as GlobalPermissionRevokeService from "./service/global_permission_revoke";
import * as GroupCreateService from "./service/group_create";
import * as GroupMemberAddService from "./service/group_member_add";
import * as GroupMemberRemoveService from "./service/group_member_remove";
import * as GroupPermissionsListService from "./service/group_permissions_list";
import * as NotificationListService from "./service/notification_list";
import * as NotificationMarkReadService from "./service/notification_mark_read";
import * as ProjectAssignService from "./service/project_assign";
import * as ProjectCloseService from "./service/project_close";
import * as ProjectCreateService from "./service/project_create";
import * as ProjectGetService from "./service/project_get";
import * as ProjectViewHistoryService from "./service/project_history_get";
import * as ProjectListService from "./service/project_list";
import * as ProjectPermissionsListService from "./service/project_permissions_list";
import * as ProjectPermissionGrantService from "./service/project_permission_grant";
import * as ProjectPermissionRevokeService from "./service/project_permission_revoke";
import * as ProjectProjectedBudgetDeleteService from "./service/project_projected_budget_delete";
import * as ProjectProjectedBudgetUpdateService from "./service/project_projected_budget_update";
import * as ProjectUpdateService from "./service/project_update";
import * as ProvisioningEndService from "./service/provisioning_end";
import * as ProvisioningStatusService from "./service/provisioning_get";
import * as ProvisioningStartService from "./service/provisioning_start";
import { ConnectionSettings } from "./service/RpcClient.h";
import * as SubprojectAssignService from "./service/subproject_assign";
import * as SubprojectCloseService from "./service/subproject_close";
import * as SubprojectCreateService from "./service/subproject_create";
import * as SubprojectGetService from "./service/subproject_get";
import * as SubprojectViewHistoryService from "./service/subproject_history_get";
import * as SubprojectListService from "./service/subproject_list";
import * as SubprojectPermissionListService from "./service/subproject_permissions_list";
import * as SubprojectPermissionGrantService from "./service/subproject_permission_grant";
import * as SubprojectPermissionRevokeService from "./service/subproject_permission_revoke";
import * as SubprojectProjectedBudgetDeleteService from "./service/subproject_projected_budget_delete";
import * as SubprojectProjectedBudgetUpdateService from "./service/subproject_projected_budget_update";
import * as SubprojectUpdateService from "./service/subproject_update";
import * as UserAssignmentsService from "./service/user_assignments_get";
import * as UserAuthenticateService from "./service/user_authenticate";
import * as UserCreateService from "./service/user_create";
import * as UserDisableService from "./service/user_disable";
import * as UserEnableService from "./service/user_enable";
import * as UserPasswordChangeService from "./service/user_password_change";
import * as UserPermissionsListService from "./service/user_permissions_list";
import * as UserPermissionGrantService from "./service/user_permission_grant";
import * as UserPermissionRevokeService from "./service/user_permission_revoke";
import * as WorkflowitemsReorderService from "./service/workflowitems_reorder";
import * as WorkflowitemAssignService from "./service/workflowitem_assign";
import * as WorkflowitemCloseService from "./service/workflowitem_close";
import * as WorkflowitemCreateService from "./service/workflowitem_create";
import * as WorkflowitemDocumentDownloadService from "./service/workflowitem_document_download";
import * as WorkflowitemGetService from "./service/workflowitem_get";
import * as WorkflowitemGetDetailsService from "./service/workflowitem_get_details";
import * as WorkflowitemViewHistoryService from "./service/workflowitem_history_get";
import * as WorkflowitemListService from "./service/workflowitem_list";
import * as WorkflowitemPermissionsListService from "./service/workflowitem_permissions_list";
import * as WorkflowitemPermissionGrantService from "./service/workflowitem_permission_grant";
import * as WorkflowitemPermissionRevokeService from "./service/workflowitem_permission_revoke";
import * as WorkflowitemUpdateService from "./service/workflowitem_update";
import * as SubprojectAssignAPI from "./subproject_assign";
import * as SubprojectProjectedBudgetDeleteAPI from "./subproject_budget_delete_projected";
import * as SubprojectProjectedBudgetUpdateAPI from "./subproject_budget_update_projected";
import * as SubprojectCloseAPI from "./subproject_close";
import * as SubprojectCreateAPI from "./subproject_create";
import * as SubprojectListAPI from "./subproject_list";
import * as SubprojectPermissionListAPI from "./subproject_permissions_list";
import * as SubprojectPermissionGrantAPI from "./subproject_permission_grant";
import * as SubprojectPermissionRevokeAPI from "./subproject_permission_revoke";
import * as SubprojectUpdateAPI from "./subproject_update";
import * as SubprojectViewDetailsAPI from "./subproject_view_details";
import * as SubprojectViewHistoryAPI from "./subproject_view_history";
import ensureStorageServiceUrlPublished from "./system/ensureOrganizationUrlPublished";
import ensurePublicKeyPublished from "./system/ensurePublicKeyPublished";
import * as UserAuthenticateAPI from "./user_authenticate";
import * as UserCreateAPI from "./user_create";
import * as UserDisableAPI from "./user_disable";
import * as UserEnableAPI from "./user_enable";
import * as UserListAPI from "./user_list";
import * as UserAssignmentsAPI from "./user_listAssignments";
import * as UserPasswordChangeAPI from "./user_password_change";
import * as UserPermissionsListAPI from "./user_permissions_list";
import * as UserPermissionGrantAPI from "./user_permission_grant";
import * as UserPermissionRevokeAPI from "./user_permission_revoke";
import * as WorkflowitemsReorderAPI from "./workflowitems_reorder";
import * as WorkflowitemAssignAPI from "./workflowitem_assign";
import * as WorkflowitemCloseAPI from "./workflowitem_close";
import * as WorkflowitemCreateAPI from "./workflowitem_create";
import * as WorkflowitemsDocumentDownloadAPI from "./workflowitem_download_document";
import * as WorkflowitemListAPI from "./workflowitem_list";
import * as WorkflowitemPermissionsListAPI from "./workflowitem_permissions_list";
import * as WorkflowitemPermissionGrantAPI from "./workflowitem_permission_grant";
import * as WorkflowitemPermissionRevokeAPI from "./workflowitem_permission_revoke";
import * as WorkflowitemUpdateAPI from "./workflowitem_update";
import * as WorkflowitemValidateDocumentAPI from "./workflowitem_validate_document";
import * as WorkflowitemViewDetailsAPI from "./workflowitem_view_details";
import * as WorkflowitemViewHistoryAPI from "./workflowitem_view_history";

const URL_PREFIX = "/api";
const DAY_MS = 86400000;

/*
 * Deal with the environment:
 */

const {
  organization,
  organizationVaultSecret,
  rootSecret,
  jwtSecret,
  port,
  swaggerBasepath,
  storageService,
  documentFeatureEnabled,
  encryptionPassword,
  signingMethod,
  accessControlAllowOrigin,
  rpc,
  blockchain,
} = getValidConfig();

/*
 * Initialize the components:
 */

const rpcSettings: ConnectionSettings = {
  protocol: "http",
  host: rpc.host,
  port: rpc.port,
  username: rpc.user,
  password: rpc.password,
};

logger.info(
  { rpcSettings: rpcSettingsWithoutPassword(rpcSettings) },
  "Connecting to MultiChain node",
);
if (encryptionPassword) {
  logger.info(
    "All data that is send to the MultiChain node and external storage will be symmetrically encrypted by the ENCRYPTION_PASSWORD",
  );
}
logger.info(
  `All data published to the chain will be signed using the ${signingMethod} signing method`,
);

const db = Multichain.init(rpcSettings);
const { multichainClient } = db;

let storageServiceSettings: AxiosRequestConfig;
if (documentFeatureEnabled) {
  storageServiceSettings = {
    baseURL: `http://${storageService.host}:${storageService.port}`,
    // 10 seconds request timeout
    timeout: 10000,
    maxBodyLength: 67000000, //  ~50mb in base64
  };
  logger.info("Documents are stored in external storage");
} else {
  storageServiceSettings = {
    baseURL: "placeholder",
    // 2.5 seconds request timeout
    timeout: 2500,
  };
}
const storageServiceClient = new StorageServiceClient(storageServiceSettings);

const server = createBasicApp(
  jwtSecret,
  URL_PREFIX,
  port,
  swaggerBasepath,
  accessControlAllowOrigin,
) as AugmentedFastifyInstance;

/*
 * Run the app:
 */

// Enable useful traces of unhandled-promise warnings:
process.on("unhandledRejection", (err) => {
  logger.fatal({ err }, "UNHANDLED PROMISE REJECTION");
  process.exit(1);
});

/**
 * Registers the current node to the blockchain
 *
 * @returns a promise containing a boolean value indicating whether the registration was successful
 */
function registerSelf(): Promise<boolean> {
  return multichainClient
    .getRpcClient()
    .invoke("listaddresses", "*", false, 1, 0)
    .then((addressInfos) =>
      addressInfos
        .filter((info) => info.ismine)
        .map((info) => info.address)
        .find((_) => true),
    )
    .then((address) => {
      const req = {
        body: {
          data: {
            address,
            organization,
          },
        },
      };
      return registerNode(multichainClient, req);
    })
    .then(() => true)
    .catch(() => false);
}

/*
 * Deprecated API-setup
 */

registerRoutes(server, db, URL_PREFIX, blockchain.host, blockchain.port, storageServiceClient, () =>
  Cache.invalidateCache(db),
);

/*
 * APIs related to Global Permissions
 */

GlobalPermissionGrantAPI.addHttpHandler(server, URL_PREFIX, {
  grantGlobalPermission: (ctx, user, userOrganization, grantee, permission) =>
    GlobalPermissionGrantService.grantGlobalPermission(
      db,
      ctx,
      user,
      userOrganization,
      grantee,
      permission,
    ),
});

GlobalPermissionsGrantAllAPI.addHttpHandler(server, URL_PREFIX, {
  getGlobalPermissions: (ctx, user) =>
    GlobalPermissionsGetService.getGlobalPermissions(db, ctx, user),
  grantGlobalPermissions: (ctx, user, userOrganization, grantee, permission) =>
    GlobalPermissionGrantService.grantGlobalPermission(
      db,
      ctx,
      user,
      userOrganization,
      grantee,
      permission,
    ),
});

GlobalPermissionRevokeAPI.addHttpHandler(server, URL_PREFIX, {
  revokeGlobalPermission: (ctx, user, userOrganization, revokee, permission) =>
    GlobalPermissionRevokeService.revokeGlobalPermission(
      db,
      ctx,
      user,
      userOrganization,
      revokee,
      permission,
    ),
});

GlobalPermissionsListAPI.addHttpHandler(server, URL_PREFIX, {
  getGlobalPermissions: (ctx, user) =>
    GlobalPermissionsGetService.getGlobalPermissions(db, ctx, user),
});

/*
 * APIs related to Users
 */

UserAuthenticateAPI.addHttpHandler(
  server,
  URL_PREFIX,
  {
    authenticate: (ctx, userId, password) =>
      UserAuthenticateService.authenticate(
        organization,
        organizationVaultSecret,
        rootSecret,
        db,
        ctx,
        userId,
        password,
      ),
    getGroupsForUser: (ctx, serviceUser, userId) =>
      GroupQueryService.getGroupsForUser(db, ctx, serviceUser, userId),
  },
  jwtSecret,
);

UserCreateAPI.addHttpHandler(server, URL_PREFIX, {
  createUser: (ctx, issuer, reqData) =>
    UserCreateService.createUser(organizationVaultSecret, db, ctx, issuer, reqData),
});

UserEnableAPI.addHttpHandler(server, URL_PREFIX, {
  enableUser: (ctx, issuer, orga, reqData) =>
    UserEnableService.enableUser(db, ctx, issuer, orga, reqData),
});

UserDisableAPI.addHttpHandler(server, URL_PREFIX, {
  disableUser: (ctx, issuer, orga, reqData) =>
    UserDisableService.disableUser(db, ctx, issuer, orga, reqData),
});

UserAssignmentsAPI.addHttpHandler(server, URL_PREFIX, {
  getUserAssignments: (ctx, issuer, orga, reqData) =>
    UserAssignmentsService.getUserAssignments(db, ctx, issuer, orga, reqData),
});

UserListAPI.addHttpHandler(server, URL_PREFIX, {
  listUsers: (ctx, issuer) => UserQueryService.getUsers(db, ctx, issuer),
  listGroups: (ctx, issuer) => GroupQueryService.getGroups(db, ctx, issuer),
});

UserPasswordChangeAPI.addHttpHandler(server, URL_PREFIX, {
  changeUserPassword: (ctx, issuer, orga, reqData) =>
    UserPasswordChangeService.changeUserPassword(db, ctx, issuer, orga, reqData),
});

UserPermissionGrantAPI.addHttpHandler(server, URL_PREFIX, {
  grantUserPermission: (ctx, granter, orga, userId, grantee, intent) =>
    UserPermissionGrantService.grantUserPermission(db, ctx, granter, orga, userId, grantee, intent),
});

UserPermissionRevokeAPI.addHttpHandler(server, URL_PREFIX, {
  revokeUserPermission: (ctx, revoker, orga, userId, revokee, intent) =>
    UserPermissionRevokeService.revokeUserPermission(
      db,
      ctx,
      revoker,
      orga,
      userId,
      revokee,
      intent,
    ),
});

UserPermissionsListAPI.addHttpHandler(server, URL_PREFIX, {
  getUserPermissions: (ctx, user, userId) =>
    UserPermissionsListService.getUserPermissions(db, ctx, user, userId),
});

/*
 * APIs related to Groups
 */

GroupCreateAPI.addHttpHandler(server, URL_PREFIX, {
  createGroup: (ctx, issuer, reqData) => GroupCreateService.createGroup(db, ctx, issuer, reqData),
});

GroupListAPI.addHttpHandler(server, URL_PREFIX, {
  listGroups: (ctx, issuer) => GroupQueryService.getGroups(db, ctx, issuer),
});

GroupMemberAddAPI.addHttpHandler(server, URL_PREFIX, {
  addGroupMembers: (ctx, issuer, groupId, newMembers) =>
    GroupMemberAddService.addMembers(db, ctx, issuer, groupId, newMembers),
});

GroupMemberRemoveAPI.addHttpHandler(server, URL_PREFIX, {
  removeGroupMembers: (ctx, issuer, groupId, members) =>
    GroupMemberRemoveService.removeMembers(db, ctx, issuer, groupId, members),
});

GroupPermissionsListAPI.addHttpHandler(server, URL_PREFIX, {
  getGroupPermissions: (ctx, issuer, groupId) =>
    GroupPermissionsListService.getGroupPermissions(db, ctx, issuer, groupId),
});

/*
 * APIs related to Notifications
 */

NotificationListAPI.addHttpHandler(server, URL_PREFIX, {
  getNotificationsForUser: (ctx, user) =>
    NotificationListService.getNotificationsForUser(db, ctx, user),
  getProject: (ctx, user, projectId) => ProjectGetService.getProject(db, ctx, user, projectId),
  getSubproject: (ctx, user, projectId, subprojectId) =>
    SubprojectGetService.getSubproject(db, ctx, user, projectId, subprojectId),
  getWorkflowitem: (ctx, user, projectId, subprojectId, workflowitemId) =>
    WorkflowitemGetService.getWorkflowitem(db, ctx, user, projectId, subprojectId, workflowitemId),
});

NotificationCountAPI.addHttpHandler(server, URL_PREFIX, {
  getNotificationsForUser: (ctx, user) =>
    NotificationListService.getNotificationsForUser(db, ctx, user),
});

NotificationMarkReadAPI.addHttpHandler(server, URL_PREFIX, {
  markRead: (ctx, user, notificationId) =>
    NotificationMarkReadService.markRead(db, ctx, user, notificationId),
});

/*
 * APIs related to Projects
 */

ProjectAssignAPI.addHttpHandler(server, URL_PREFIX, {
  assignProject: (ctx, user, projectId, assignee) =>
    ProjectAssignService.assignProject(db, ctx, user, projectId, assignee),
});

ProjectCloseAPI.addHttpHandler(server, URL_PREFIX, {
  closeProject: (ctx, user, projectId) =>
    ProjectCloseService.closeProject(db, ctx, user, projectId),
});

ProjectCreateAPI.addHttpHandler(server, URL_PREFIX, {
  createProject: (ctx, user, body) => ProjectCreateService.createProject(db, ctx, user, body),
});

ProjectUpdateAPI.addHttpHandler(server, URL_PREFIX, {
  updateProject: (ctx, user, projectId, reqData) =>
    ProjectUpdateService.updateProject(db, ctx, user, projectId, reqData),
});

ProjectPermissionGrantAPI.addHttpHandler(server, URL_PREFIX, {
  grantProjectPermission: (ctx, user, projectId, grantee, intent) =>
    ProjectPermissionGrantService.grantProjectPermission(db, ctx, user, projectId, grantee, intent),
});

ProjectPermissionRevokeAPI.addHttpHandler(server, URL_PREFIX, {
  revokeProjectPermission: (ctx, user, projectId, grantee, intent) =>
    ProjectPermissionRevokeService.revokeProjectPermission(
      db,
      ctx,
      user,
      projectId,
      grantee,
      intent,
    ),
});

ProjectPermissionsListAPI.addHttpHandler(server, URL_PREFIX, {
  getProjectPermissions: (ctx, user, projectId) =>
    ProjectPermissionsListService.getProjectPermissions(db, ctx, user, projectId),
});

ProjectListAPI.addHttpHandler(server, URL_PREFIX, {
  listProjects: (ctx, user) => ProjectListService.listProjects(db, ctx, user),
});

ProjectViewDetailsAPI.addHttpHandler(server, URL_PREFIX, {
  getProject: (ctx, user, projectId) => ProjectGetService.getProject(db, ctx, user, projectId),
  getSubprojects: (ctx, user, projectId) =>
    SubprojectListService.listSubprojects(db, ctx, user, projectId),
});

ProjectViewHistoryAPI.addHttpHandler(server, URL_PREFIX, {
  getProjectHistory: (ctx, user, projectId, filter) =>
    ProjectViewHistoryService.getProjectHistory(db, ctx, user, projectId, filter),
});

ProjectProjectedBudgetUpdateAPI.addHttpHandler(server, URL_PREFIX, {
  updateProjectedBudget: (ctx, user, projectId, orga, amount, currencyCode) =>
    ProjectProjectedBudgetUpdateService.updateProjectedBudget(
      db,
      ctx,
      user,
      projectId,
      orga,
      amount,
      currencyCode,
    ),
});

ProjectProjectedBudgetDeleteAPI.addHttpHandler(server, URL_PREFIX, {
  deleteProjectedBudget: (ctx, user, projectId, orga, currencyCode) =>
    ProjectProjectedBudgetDeleteService.deleteProjectedBudget(
      db,
      ctx,
      user,
      projectId,
      orga,
      currencyCode,
    ),
});

/*
 * APIs related to Subprojects
 */

SubprojectAssignAPI.addHttpHandler(server, URL_PREFIX, {
  assignSubproject: (ctx, user, projectId, subprojectId, assignee) =>
    SubprojectAssignService.assignSubproject(db, ctx, user, projectId, subprojectId, assignee),
});

SubprojectCloseAPI.addHttpHandler(server, URL_PREFIX, {
  closeSubproject: (ctx, user, projectId, subprojectId) =>
    SubprojectCloseService.closeSubproject(db, ctx, user, projectId, subprojectId),
});

SubprojectCreateAPI.addHttpHandler(server, URL_PREFIX, {
  createSubproject: (ctx, user, body) =>
    SubprojectCreateService.createSubproject(db, ctx, user, body),
});

SubprojectListAPI.addHttpHandler(server, URL_PREFIX, {
  listSubprojects: (ctx, user, projectId) =>
    SubprojectListService.listSubprojects(db, ctx, user, projectId),
});

SubprojectViewDetailsAPI.addHttpHandler(server, URL_PREFIX, {
  getProject: (ctx, user, projectId) => ProjectGetService.getProject(db, ctx, user, projectId),
  getSubproject: (ctx, user, projectId, subprojectId) =>
    SubprojectGetService.getSubproject(db, ctx, user, projectId, subprojectId),
  getWorkflowitems: (ctx, user, projectId, subprojectId) =>
    WorkflowitemListService.listWorkflowitems(db, ctx, user, projectId, subprojectId),
});

SubprojectViewHistoryAPI.addHttpHandler(server, URL_PREFIX, {
  getSubprojectHistory: (ctx, user, projectId, subprojectId, filter) =>
    SubprojectViewHistoryService.getSubprojectHistory(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      filter,
    ),
});

SubprojectPermissionListAPI.addHttpHandler(server, URL_PREFIX, {
  listSubprojectPermissions: (ctx, user, projectId, subprojectId) =>
    SubprojectPermissionListService.listSubprojectPermissions(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
    ),
});

SubprojectPermissionGrantAPI.addHttpHandler(server, URL_PREFIX, {
  grantSubprojectPermission: (ctx, user, projectId, subprojectId, grantee, intent) =>
    SubprojectPermissionGrantService.grantSubprojectPermission(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      grantee,
      intent,
    ),
});

SubprojectPermissionRevokeAPI.addHttpHandler(server, URL_PREFIX, {
  revokeSubprojectPermission: (ctx, user, projectId, subprojectId, revokeee, intent) =>
    SubprojectPermissionRevokeService.revokeSubprojectPermission(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      revokeee,
      intent,
    ),
});

SubprojectProjectedBudgetUpdateAPI.addHttpHandler(server, URL_PREFIX, {
  updateProjectedBudget: (ctx, user, projectId, subprojectId, orga, amount, currencyCode) =>
    SubprojectProjectedBudgetUpdateService.updateProjectedBudget(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      orga,
      amount,
      currencyCode,
    ),
});

SubprojectProjectedBudgetDeleteAPI.addHttpHandler(server, URL_PREFIX, {
  deleteProjectedBudget: (ctx, user, projectId, subprojectId, orga, currencyCode) =>
    SubprojectProjectedBudgetDeleteService.deleteProjectedBudget(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      orga,
      currencyCode,
    ),
});

WorkflowitemsReorderAPI.addHttpHandler(server, URL_PREFIX, {
  setWorkflowitemOrdering: (ctx, user, projectId, subprojectId, ordering) =>
    WorkflowitemsReorderService.setWorkflowitemOrdering(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      ordering,
    ),
});

SubprojectUpdateAPI.addHttpHandler(server, URL_PREFIX, {
  updateSubproject: (ctx, user, projectId, subprojectId, requestData) =>
    SubprojectUpdateService.updateSubproject(db, ctx, user, projectId, subprojectId, requestData),
});

/*
 * APIs related to Workflowitem
 */

WorkflowitemListAPI.addHttpHandler(server, URL_PREFIX, {
  listWorkflowitems: (ctx, user, projectId, subprojectId) =>
    WorkflowitemListService.listWorkflowitems(db, ctx, user, projectId, subprojectId),
});

WorkflowitemViewDetailsAPI.addHttpHandler(server, URL_PREFIX, {
  getWorkflowitemDetails: (ctx, user, projectId, subprojectId, workflowitemId) =>
    WorkflowitemGetDetailsService.getWorkflowitemDetails(
      db,
      storageServiceClient,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
    ),
});

WorkflowitemViewHistoryAPI.addHttpHandler(server, URL_PREFIX, {
  getWorkflowitemHistory: (ctx, user, projectId, subprojectId, workflowitemId, filter) =>
    WorkflowitemViewHistoryService.getWorkflowitemHistory(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
      filter,
    ),
});

WorkflowitemPermissionsListAPI.addHttpHandler(server, URL_PREFIX, {
  listWorkflowitemPermissions: (ctx, user, projectId, subprojectId, workflowitemId) =>
    WorkflowitemPermissionsListService.listWorkflowitemPermissions(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
    ),
});

WorkflowitemCloseAPI.addHttpHandler(server, URL_PREFIX, {
  closeWorkflowitem: (ctx, user, projectId, subprojectId, workflowitemId, rejectReason) =>
    WorkflowitemCloseService.closeWorkflowitem(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
      rejectReason,
    ),
});

WorkflowitemCreateAPI.addHttpHandler(server, URL_PREFIX, {
  createWorkflowitem: (ctx, user, requestData) =>
    WorkflowitemCreateService.createWorkflowitem(db, storageServiceClient, ctx, user, requestData),
});

WorkflowitemAssignAPI.addHttpHandler(server, URL_PREFIX, {
  assignWorkflowItem: (ctx, user, projectId, subprojectId, workflowitemId, assignee) =>
    WorkflowitemAssignService.assignWorkflowitem(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
      assignee,
    ),
});

WorkflowitemPermissionGrantAPI.addHttpHandler(server, URL_PREFIX, {
  grantWorkflowitemPermission: (
    ctx,
    user,
    projectId,
    subprojectId,
    workflowitemId,
    grantee,
    intent,
  ) =>
    WorkflowitemPermissionGrantService.grantWorkflowitemPermission(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
      grantee,
      intent,
    ),
});

WorkflowitemPermissionRevokeAPI.addHttpHandler(server, URL_PREFIX, {
  revokeWorkflowitemPermission: (
    ctx,
    user,
    projectId,
    subprojectId,
    workflowitemId,
    revokee,
    intent,
  ) =>
    WorkflowitemPermissionRevokeService.revokeWorkflowitemPermission(
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
      revokee,
      intent,
    ),
});

WorkflowitemUpdateAPI.addHttpHandler(server, URL_PREFIX, {
  updateWorkflowitem: (ctx, user, projectId, subprojectId, workflowitemId, data) =>
    WorkflowitemUpdateService.updateWorkflowitem(
      db,
      storageServiceClient,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
      data,
    ),
});

WorkflowitemValidateDocumentAPI.addHttpHandler(server, URL_PREFIX, {
  matches: (
    documentBase64: string,
    expectedSHA256: string,
    id: string,
    ctx,
    user,
    projectId,
    subprojectId,
    workflowitemId,
  ) =>
    DocumentValidationService.isSameDocument(
      documentBase64,
      expectedSHA256,
      id,
      db,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
    ),
});

WorkflowitemsDocumentDownloadAPI.addHttpHandler(server, URL_PREFIX, {
  getDocument: (ctx, user, projectId, subprojectId, workflowitemId, documentId) =>
    WorkflowitemDocumentDownloadService.getDocument(
      db,
      storageServiceClient,
      ctx,
      user,
      projectId,
      subprojectId,
      workflowitemId,
      documentId,
    ),
});

/*
 * APIs related to system
 */

ProvisioningStartAPI.addHttpHandler(server, URL_PREFIX, {
  setProvisioningStartFlag: (ctx, user) =>
    ProvisioningStartService.setProvisioningStartFlag(db, ctx, user),
});

ProvisioningEndAPI.addHttpHandler(server, URL_PREFIX, {
  setProvisioningEndFlag: (ctx, user) =>
    ProvisioningEndService.setProvisioningEndFlag(db, ctx, user),
});

ProvisioningStatusAPI.addHttpHandler(server, URL_PREFIX, {
  getProvisionStatus: (ctx, user) => ProvisioningStatusService.getProvisionStatus(db, ctx, user),
});

/*
 * Run the server.
 */

server.listen({ port, host: "0.0.0.0" }, async (err) => {
  if (err) {
    logger.fatal({ err }, "Connection could not be established. Aborting.");
    logger.trace();
    process.exit(1);
  }

  const retryIntervalMs = 5000;

  while (!(await isReady(multichainClient))) {
    logger.info(
      `MultiChain connection/permissions not ready yet. Trying again in ${retryIntervalMs / 1000}s`,
    );
    await timeout(retryIntervalMs);
  }

  while (
    !(await ensureOrganizationStream(multichainClient, organization!, organizationVaultSecret!)
      .then((adr) => {
        logger.debug({ adr }, "Ensured Organisation Address");
        return true;
      })
      .catch((err) => {
        logger.warn(
          { err, multichainClient, organization },
          `Failed to create organization stream. Trying again in ${retryIntervalMs / 1000}s`,
        );
        return false;
      }))
  ) {
    await timeout(retryIntervalMs);
  }
  logger.debug({ multichainClient, organization }, "Organization stream present");

  while (!(await registerSelf())) {
    logger.info(
      { multichainClient, organization },
      `Failed to register node. Trying again in ${retryIntervalMs / 1000}s`,
    );
    await timeout(retryIntervalMs);
  }
  logger.debug({ params: { multichainClient, organization } }, "Node registered in nodes stream");

  const ensurePublicKeyPublishedResult = await ensurePublicKeyPublished(db, organization);
  if (Result.isErr(ensurePublicKeyPublishedResult)) {
    logger.fatal(ensurePublicKeyPublishedResult);
    process.exit(1);
  }
  if (documentFeatureEnabled) {
    const storageServiceUrlResult = await ensureStorageServiceUrlPublished(db, organization);
    if (Result.isErr(storageServiceUrlResult)) {
      logger.fatal(storageServiceUrlResult);
      process.exit(1);
    }
  }

  // Logging peerinfo runs immidiately and then every 24H on every API (use DAY_MS)
  checkNodes(multichainClient);
  setInterval(async () => {
    checkNodes(multichainClient);
  }, DAY_MS);
});

/**
 * Gets the current Rpc {@link ConnectionSettings} and strips down the RPC password
 *
 * @param settings the current Rpc {@link ConnectionSettings}
 * @returns a copy of the current Rpc {@link ConnectionSettings} without the RPC password
 * @notExported
 */
function rpcSettingsWithoutPassword(settings) {
  const tmp = deepcopy(settings);
  delete tmp.password;
  return tmp;
}
