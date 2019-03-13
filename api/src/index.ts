import * as GlobalPermissionGrantAPI from "./global_permission_grant";
import * as GlobalPermissionRevokeAPI from "./global_permission_revoke";
import * as GlobalPermissionsGrantAllAPI from "./global_permissions_grant_all";
import * as GlobalPermissionsListAPI from "./global_permissions_list";
import * as GroupCreateAPI from "./group_create";
import * as GroupListAPI from "./group_list";
import * as GroupMemberAddAPI from "./group_member_add";
import * as GroupMemberRemoveAPI from "./group_member_remove";
import { registerRoutes } from "./httpd/router";
import { createBasicApp } from "./httpd/server";
import { Ctx } from "./lib/ctx";
import deepcopy from "./lib/deepcopy";
import logger from "./lib/logger";
import { isReady } from "./lib/readiness";
import timeout from "./lib/timeout";
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
import * as ProjectPermissionGrantAPI from "./project_permission_grant";
import * as ProjectPermissionRevokeAPI from "./project_permission_revoke";
import * as ProjectPermissionsListAPI from "./project_permissions_list";
import * as ProjectUpdateAPI from "./project_update";
import * as ProjectViewDetailsAPI from "./project_view_details";
import * as ProjectViewHistoryAPI from "./project_view_history";
import * as Multichain from "./service";
import { BusinessEvent } from "./service/domain/business_event";
import { ServiceUser } from "./service/domain/organization/service_user";
import * as Subproject from "./service/domain/workflow/subproject";
import * as GlobalPermissionGrantService from "./service/global_permission_grant";
import * as GlobalPermissionRevokeService from "./service/global_permission_revoke";
import * as GlobalPermissionsGetService from "./service/global_permissions_get";
import * as GroupCreateService from "./service/group_create";
import * as GroupMemberAddService from "./service/group_member_add";
import * as GroupMemberRemoveService from "./service/group_member_remove";
import * as GroupQueryService from "./service/group_query";
import { randomString } from "./service/hash";
import * as HttpdMultichainAdapter from "./service/HttpdMultichainAdapter";
import * as NotificationListService from "./service/notification_list";
import * as NotificationMarkReadService from "./service/notification_mark_read";
import * as ProjectAssignService from "./service/project_assign";
import * as ProjectCloseService from "./service/project_close";
import * as ProjectCreateService from "./service/project_create";
import * as ProjectGetService from "./service/project_get";
import * as ProjectListService from "./service/project_list";
import * as ProjectPermissionGrantService from "./service/project_permission_grant";
import * as ProjectPermissionRevokeService from "./service/project_permission_revoke";
import * as ProjectPermissionsListService from "./service/project_permissions_list";
import * as ProjectProjectedBudgetDeleteService from "./service/project_projected_budget_delete";
import * as ProjectProjectedBudgetUpdateService from "./service/project_projected_budget_update";
import * as ProjectUpdateService from "./service/project_update";
import { ConnectionSettings } from "./service/RpcClient.h";
import * as SubprojectProjectedBudgetDeleteService from "./service/subproject_projected_budget_delete";
import * as SubprojectProjectedBudgetUpdateService from "./service/subproject_projected_budget_update";
import * as UserAuthenticateService from "./service/user_authenticate";
import * as UserCreateService from "./service/user_create";
import * as UserQueryService from "./service/user_query";
import * as OldSubprojectModel from "./subproject/model/Subproject";
import * as SubprojectProjectedBudgetDeleteAPI from "./subproject_budget_delete_projected";
import * as SubprojectProjectedBudgetUpdateAPI from "./subproject_budget_update_projected";
import * as UserAuthenticateAPI from "./user_authenticate";
import * as UserCreateAPI from "./user_create";
import * as UserListAPI from "./user_list";

const URL_PREFIX = "/api";

/*
 * Deal with the environment:
 */

const port: number = (process.env.PORT && parseInt(process.env.PORT, 10)) || 8080;

const jwtSecret: string = process.env.JWT_SECRET || randomString(32);
if (jwtSecret.length < 32) {
  logger.warn("Warning: the JWT secret key should be at least 32 characters long.");
}
const rootSecret: string = process.env.ROOT_SECRET || randomString(32);
if (!process.env.ROOT_SECRET) {
  logger.warn(`Warning: root password not set; autogenerated to ${rootSecret}`);
}
const organization: string = process.env.ORGANIZATION || "";
if (!organization) {
  logger.fatal(`Please set ORGANIZATION to the organization this node belongs to.`);
  process.exit(1);
}
const organizationVaultSecret: string = process.env.ORGANIZATION_VAULT_SECRET || "";
if (!organizationVaultSecret) {
  logger.fatal(
    `Please set ORGANIZATION_VAULT_SECRET to the secret key used to encrypt the organization's vault.`,
  );
  process.exit(1);
}

const SWAGGER_BASEPATH = process.env.SWAGGER_BASEPATH || "/";

/*
 * Initialize the components:
 */

const multichainHost = process.env.RPC_HOST || "localhost";
const backupApiPort = process.env.BACKUP_API_PORT || "8085";

const rpcSettings: ConnectionSettings = {
  protocol: "http",
  host: multichainHost,
  port: parseInt(process.env.RPC_PORT || "8000", 10),
  username: process.env.RPC_USER || "multichainrpc",
  password: process.env.RPC_PASSWORD || "s750SiJnj50yIrmwxPnEdSzpfGlTAHzhaUwgqKeb0G1j",
};

const env = process.env.NODE_ENV || "";

logger.info(
  { rpcSettings: rpcSettingsWithoutPassword(rpcSettings) },
  "Connecting to MultiChain node",
);
const db = Multichain.init(rpcSettings);
const { multichainClient } = db;

const server = createBasicApp(jwtSecret, URL_PREFIX, port, SWAGGER_BASEPATH, env);

/*
 * Run the app:
 */
// server.register(require('./'), { prefix: '/api' })

// Enable useful traces of unhandled-promise warnings:
process.on("unhandledRejection", err => {
  logger.fatal(err, "UNHANDLED PROMISE REJECTION");
  process.exit(1);
});

function registerSelf(): Promise<boolean> {
  return multichainClient
    .getRpcClient()
    .invoke("listaddresses", "*", false, 1, 0)
    .then(addressInfos =>
      addressInfos
        .filter(info => info.ismine)
        .map(info => info.address)
        .find(_ => true),
    )
    .then(address => {
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

registerRoutes(server, db, URL_PREFIX, multichainHost, backupApiPort, {
  workflowitemAssigner: HttpdMultichainAdapter.assignWorkflowitem(db),
  workflowitemCloser: HttpdMultichainAdapter.closeWorkflowitem(db),
  workflowitemLister: HttpdMultichainAdapter.getWorkflowitemList(db),
  workflowitemUpdater: HttpdMultichainAdapter.updateWorkflowitem(db),
});

/*
 * APIs related to Global Permissions
 */

GlobalPermissionGrantAPI.addHttpHandler(server, URL_PREFIX, {
  grantGlobalPermission: (ctx, user, grantee, permission) =>
    GlobalPermissionGrantService.grantGlobalPermission(db, ctx, user, grantee, permission),
});

GlobalPermissionsGrantAllAPI.addHttpHandler(server, URL_PREFIX, {
  getGlobalPermissions: (ctx, user) =>
    GlobalPermissionsGetService.getGlobalPermissions(db, ctx, user),
  grantGlobalPermissions: (ctx, user, grantee, permission) =>
    GlobalPermissionGrantService.grantGlobalPermission(db, ctx, user, grantee, permission),
});

GlobalPermissionRevokeAPI.addHttpHandler(server, URL_PREFIX, {
  revokeGlobalPermission: (ctx, user, revokee, permission) =>
    GlobalPermissionRevokeService.revokeGlobalPermission(db, ctx, user, revokee, permission),
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

UserListAPI.addHttpHandler(server, URL_PREFIX, {
  listUsers: (ctx, issuer) => UserQueryService.getUsers(db, ctx, issuer),
  listGroups: (ctx, issuer) => GroupQueryService.getGroups(db, ctx, issuer),
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
  addGroupMember: (ctx, issuer, groupId, newMember) =>
    GroupMemberAddService.addMember(db, ctx, issuer, groupId, newMember),
});

GroupMemberRemoveAPI.addHttpHandler(server, URL_PREFIX, {
  removeGroupMember: (ctx, issuer, groupId, newMember) =>
    GroupMemberRemoveService.removeMember(db, ctx, issuer, groupId, newMember),
});

/*
 * APIs related to Notifications
 */

NotificationListAPI.addHttpHandler(server, URL_PREFIX, {
  getNotificationsForUser: (ctx, user) =>
    NotificationListService.getNotificationsForUser(db, ctx, user),
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
  getSubprojects: async (
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
  ): Promise<Subproject.Subproject[]> => {
    const subprojects: OldSubprojectModel.SubprojectResource[] = await OldSubprojectModel.get(
      db.multichainClient,
      { userId: user.id, groups: user.groups },
      projectId,
    );
    const newSubprojects: Subproject.Subproject[] = [];
    for (const x of subprojects) {
      const permissions = await OldSubprojectModel.getPermissions(
        db.multichainClient,
        projectId,
        x.data.id,
      );
      newSubprojects.push({
        id: x.data.id,
        createdAt: new Date(x.data.creationUnixTs).toISOString(),
        status: x.data.status,
        displayName: x.data.displayName,
        description: x.data.description,
        assignee: x.data.assignee,
        currency: x.data.currency,
        projectedBudgets: x.data.projectedBudgets,
        additionalData: x.data.additionalData,
        permissions,
        log: x.log.map(l => ({
          entityId: l.key,
          entityType: "subproject" as "subproject",
          businessEvent: {
            type: l.intent.replace(".", "_").concat(l.intent.endsWith("e") ? "d" : "ed"),
            source: "",
            time: l.createdAt,
            publisher: l.createdBy,
          } as BusinessEvent,
          snapshot: l.snapshot,
        })),
      });
    }
    return newSubprojects;
  },
});

ProjectViewHistoryAPI.addHttpHandler(server, URL_PREFIX, {
  getProject: (ctx, user, projectId) => ProjectGetService.getProject(db, ctx, user, projectId),
  getSubprojects: async (
    ctx: Ctx,
    user: ServiceUser,
    projectId: string,
  ): Promise<Subproject.Subproject[]> => {
    const subprojects: OldSubprojectModel.SubprojectResource[] = await OldSubprojectModel.get(
      db.multichainClient,
      { userId: user.id, groups: user.groups },
      projectId,
    );
    const newSubprojects: Subproject.Subproject[] = [];
    for (const x of subprojects) {
      const permissions = await OldSubprojectModel.getPermissions(
        db.multichainClient,
        projectId,
        x.data.id,
      );
      newSubprojects.push({
        id: x.data.id,
        createdAt: new Date(x.data.creationUnixTs).toISOString(),
        status: x.data.status,
        displayName: x.data.displayName,
        description: x.data.description,
        assignee: x.data.assignee,
        currency: x.data.currency,
        projectedBudgets: x.data.projectedBudgets,
        additionalData: x.data.additionalData,
        permissions,
        log: x.log.map(l => ({
          entityId: l.key,
          entityType: "subproject" as "subproject",
          businessEvent: {
            type: l.intent.replace(".", "_").concat(l.intent.endsWith("e") ? "d" : "ed"),
            source: "",
            time: l.createdAt,
            publisher: l.createdBy,
          } as BusinessEvent,
          snapshot: l.snapshot,
        })),
      });
    }
    return newSubprojects;
  },
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

/*
 * Run the server.
 */

server.listen(port, "0.0.0.0", async err => {
  if (err) {
    logger.fatal({ err }, "Connection could not be established. Aborting.");
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
      .then(() => true)
      .catch(() => false))
  ) {
    logger.info(
      { multichainClient, organization },
      `Failed to create organization stream. Trying again in ${retryIntervalMs / 1000}s`,
    );
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
});

function rpcSettingsWithoutPassword(settings) {
  const tmp = deepcopy(settings);
  delete tmp.password;
  return tmp;
}
