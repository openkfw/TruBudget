/**
 * Binds the HTTP context and the other contexts together, hiding the
 * implementation details in the process.
 *
 * Please make sure that callback arguments are always used and not replaced
 * with variables of the enclosing scope. Doing so introduces business logic
 * into the adapter and could lead to subtle bugs.
 *
 * Also note that arguments should be treated as immutable.
 *
 */
import { getAllowedIntents } from "./authz";
import Intent from "./authz/intents";
import { AuthToken } from "./authz/token";
import * as Permission from "./global";
import * as HTTP from "./httpd";
import * as Multichain from "./multichain";
import { MultichainClient } from "./multichain/Client.h";
import * as Group from "./multichain/groups";
import * as Notification from "./notification";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

export function getProject(multichainClient: MultichainClient): HTTP.ProjectReader {
  return async (token: AuthToken, projectId: string) => {
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    const project: Project.ScrubbedProject = await Project.getOne(actingUser, projectId, {
      getProject: async id => {
        const multichainProject: Multichain.Project = await Multichain.getProject(
          multichainClient,
          id,
        );
        return Project.validateProject(multichainProjectToProjectProject(multichainProject));
      },
    });

    const subprojects: Subproject.ScrubbedSubproject[] = await Subproject.getAllVisible(
      actingUser,
      projectId,
      {
        getAllSubprojects: async id => {
          const list: Multichain.Subproject[] = await Multichain.getSubprojectList(
            multichainClient,
            id,
          );
          return list.map(multichainSubproject => {
            return Subproject.validateSubproject(
              multichainSubprojectToSubprojectSubproject(multichainSubproject),
            );
          });
        },
      },
    );

    const httpProject: HTTP.ProjectAndSubprojects = {
      project: {
        log: project.log.map(scrubbedEvent =>
          scrubbedEvent === null
            ? null
            : {
                intent: scrubbedEvent.intent,
                snapshot: {
                  displayName: scrubbedEvent.snapshot.displayName,
                },
              },
        ),
        allowedIntents: getAllowedIntents(Project.userIdentities(actingUser), project.permissions),
        data: {
          id: project.id,
          creationUnixTs: project.creationUnixTs,
          status: project.status,
          displayName: project.displayName,
          assignee: project.assignee,
          description: project.description,
          amount: project.amount,
          currency: project.currency,
          thumbnail: project.thumbnail,
        },
      },
      subprojects: subprojects.map(x => ({
        allowedIntents: getAllowedIntents(
          Subproject.userIdentities({ id: actingUser.id, groups: actingUser.groups }),
          x.permissions,
        ),
        data: {
          id: x.id,
          creationUnixTs: x.creationUnixTs,
          status: x.status,
          displayName: x.displayName,
          description: x.description,
          amount: x.amount,
          currency: x.currency,
          exchangeRate: x.exchangeRate,
          billingDate: x.billingDate,
          assignee: x.assignee,
        },
      })),
    };

    return httpProject;
  };
}

export function getProjectPermissionList(
  multichainClient: MultichainClient,
): HTTP.ProjectPermissionsReader {
  return async (token: AuthToken, projectId: string) => {
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    const reader: Project.Reader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(
        multichainClient,
        id,
      );
      return Project.validateProject(multichainProjectToProjectProject(multichainProject));
    };

    const permissionsReader: Project.PermissionsLister = async id => {
      const permissions: Multichain.Permissions = await Multichain.getProjectPermissionList(
        multichainClient,
        id,
      );
      return permissions;
    };

    return Project.getPermissions(actingUser, projectId, {
      getProject: reader,
      getProjectPermissions: permissionsReader,
    });
  };
}

export function getProjectList(multichainClient: MultichainClient): HTTP.AllProjectsReader {
  return async (token: AuthToken) => {
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    const lister: Project.ListReader = async () => {
      const projectList: Multichain.Project[] = await Multichain.getProjectList(multichainClient);
      return projectList.map(multichainProject => {
        return Project.validateProject(multichainProjectToProjectProject(multichainProject));
      });
    };
    const projects: Project.ScrubbedProject[] = await Project.getAllVisible(actingUser, {
      getAllProjects: lister,
    });
    return projects.map(project => ({
      log: project.log.map(scrubbedEvent => {
        if (scrubbedEvent === null) return null;
        return {
          intent: scrubbedEvent.intent,
          snapshot: {
            displayName: scrubbedEvent.snapshot.displayName,
          },
        };
      }),
      allowedIntents: getAllowedIntents(Project.userIdentities(actingUser), project.permissions),
      data: {
        id: project.id,
        creationUnixTs: project.creationUnixTs,
        status: project.status,
        displayName: project.displayName,
        assignee: project.assignee,
        description: project.description,
        amount: project.amount,
        currency: project.currency,
        thumbnail: project.thumbnail,
      },
    }));
  };
}

export function createProject(multichainClient: MultichainClient): HTTP.ProjectCreator {
  return async (token: AuthToken, payload: HTTP.CreateProjectPayload) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const assigningUser: Project.User = { id: token.userId, groups: token.groups };

    const permissionLister: Permission.PermissionsLister = async () => {
      const permissions: Multichain.Permissions = await Multichain.getGlobalPermissionList(
        multichainClient,
      );
      return permissions;
    };

    const projectReader: Project.Reader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(
        multichainClient,
        id,
      );
      return Project.validateProject(multichainProjectToProjectProject(multichainProject));
    };

    const creator: Project.Creator = async project => {
      Project.validateProject(project);

      const multichainProject: Multichain.Project = { ...project, log: [] };

      Multichain.createProjectOnChain(multichainClient, issuer, multichainProject);
    };

    const input: Project.CreateProjectInput = payload;

    return Project.create(assigningUser, input, {
      getAllPermissions: permissionLister,
      getProject: projectReader,
      createProject: creator,
    });
  };
}

export function assignProject(multichainClient: MultichainClient): HTTP.ProjectAssigner {
  return async (token: AuthToken, projectId: string, assignee: string) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    const multichainAssigner: Project.Assigner = (id, selectedAssignee) =>
      Multichain.writeProjectAssignedToChain(multichainClient, issuer, id, selectedAssignee);

    const multichainNotifier: Project.AssignmentNotifier = (project, user) => {
      const notificationResource = Multichain.generateResources(project.id);
      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(
          multichainClient,
          issuer,
          message,
          recipient,
          notificationResource,
        );

      const resolver: Notification.GroupResolver = groupId =>
        Group.getUsers(multichainClient, groupId);

      const assignmentNotification: Notification.ProjectAssignment = {
        projectId: project.id,
        actingUser: user,
        assignee: project.assignee,
      };

      return Notification.projectAssigned(assignmentNotification, {
        send: sender,
        resolveGroup: resolver,
      });
    };

    const reader: Project.Reader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(
        multichainClient,
        id,
      );

      return Project.validateProject(multichainProjectToProjectProject(multichainProject));
    };

    return Project.assign(actingUser, projectId, assignee, {
      getProject: reader,
      saveProjectAssignment: multichainAssigner,
      notify: multichainNotifier,
    });
  };
}

export function updateProject(multichainClient: MultichainClient): HTTP.ProjectUpdater {
  return async (token: AuthToken, projectId: string, update: object) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    const reader: Project.Reader = async id => {
      const multichainProject = await Multichain.getProject(multichainClient, id);
      return Project.validateProject(multichainProjectToProjectProject(multichainProject));
    };

    const updater: Project.Updater = async (id, data) => {
      const multichainUpdate: Multichain.ProjectUpdate = {};
      if (data.displayName !== undefined) multichainUpdate.displayName = data.displayName;
      if (data.description !== undefined) multichainUpdate.description = data.description;
      if (data.amount !== undefined) multichainUpdate.amount = data.amount;
      if (data.currency !== undefined) multichainUpdate.currency = data.currency;
      if (data.thumbnail !== undefined) multichainUpdate.thumbnail = data.thumbnail;

      await Multichain.updateProject(multichainClient, issuer, id, multichainUpdate);
    };

    const multichainNotifier: Project.UpdateNotifier = (updatedProject, user, projectUpdate) => {
      const notificationResource = Multichain.generateResources(updatedProject.id);
      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(
          multichainClient,
          issuer,
          message,
          recipient,
          notificationResource,
        );

      const resolver: Notification.GroupResolver = groupId =>
        Group.getUsers(multichainClient, groupId);

      const updateNotification: Notification.ProjectUpdate = {
        projectId: updatedProject.id,
        assignee: updatedProject.assignee,
        actingUser: user,
        update: projectUpdate,
      };

      return Notification.projectUpdated(updateNotification, {
        send: sender,
        resolveGroup: resolver,
      });
    };

    return Project.update(actingUser, projectId, update, {
      getProject: reader,
      updateProject: updater,
      notify: multichainNotifier,
    });
  };
}

function multichainProjectToProjectProject(multichainProject: Multichain.Project): Project.Project {
  return {
    id: multichainProject.id,
    creationUnixTs: multichainProject.creationUnixTs,
    status: multichainProject.status,
    displayName: multichainProject.displayName,
    assignee: multichainProject.assignee,
    description: multichainProject.description,
    amount: multichainProject.amount,
    currency: multichainProject.currency,
    thumbnail: multichainProject.thumbnail,
    permissions: multichainProject.permissions,
    log: multichainProject.log.map(log => {
      return {
        ...log,
        snapshot: {
          displayName: log.snapshot.displayName,
          permissions: {},
        },
      };
    }),
  };
}

export function getWorkflowitemList(
  multichainClient: MultichainClient,
): HTTP.AllWorkflowitemsReader {
  return async (token: AuthToken, projectId: string, subprojectId: string) => {
    const user: Workflowitem.User = { id: token.userId, groups: token.groups };

    // Get ordering of workflowitems from blockchain
    // If items are rearranged by user, the call returns an array of IDs in order
    const orderingReader: Workflowitem.OrderingReader = async () => {
      const ordering: string[] = await Multichain.getWorkflowitemOrdering(
        multichainClient,
        projectId,
        subprojectId,
      );
      return ordering;
    };

    // Get all unfiltered workflowitems from the blockchain
    const lister: Workflowitem.ListReader = async () => {
      const workflowitemList: Multichain.Workflowitem[] = await Multichain.getWorkflowitemList(
        multichainClient,
        projectId,
        subprojectId,
      );
      return workflowitemList.map(Workflowitem.validateWorkflowitem);
    };

    // Filter workflowitems based on business logic:
    // Redact data, redact history events and remove log
    const workflowitems = await Workflowitem.getAllScrubbedItems(user, {
      getAllWorkflowitems: lister,
      getWorkflowitemOrdering: orderingReader,
    });

    // Map data to HTTP response
    return workflowitems.map(item => ({
      data: {
        id: item.id,
        creationUnixTs: item.creationUnixTs,
        status: item.status,
        amountType: item.amountType,
        displayName: item.displayName,
        description: item.description,
        amount: item.amount,
        assignee: item.assignee,
        currency: item.currency,
        billingDate: item.billingDate,
        exchangeRate: item.exchangeRate,
        documents: item.documents,
      },
      allowedIntents: item.permissions
        ? getAllowedIntents(Workflowitem.userIdentities(user), item.permissions)
        : [],
    }));
  };
}
export function closeWorkflowitem(multichainClient: MultichainClient): HTTP.WorkflowitemCloser {
  return async (
    token: AuthToken,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
  ) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const closingUser: Workflowitem.User = { id: token.userId, groups: token.groups };

    // Get ordering of workflowitems from blockchain
    // If items are rearranged by user, the call returns an array of IDs in order
    const multichainOrderingReader: Workflowitem.OrderingReader = async () => {
      const ordering: string[] = await Multichain.getWorkflowitemOrdering(
        multichainClient,
        projectId,
        subprojectId,
      );
      return ordering;
    };

    // Get all unfiltered workflowitems from the blockchain
    const multichainLister: Workflowitem.ListReader = async () => {
      const workflowitemList: Multichain.Workflowitem[] = await Multichain.getWorkflowitemList(
        multichainClient,
        projectId,
        subprojectId,
      );
      return workflowitemList.map(Workflowitem.validateWorkflowitem);
    };
    const multichainCloser: Workflowitem.Closer = async workflowitem => {
      Multichain.closeWorkflowitem(multichainClient, issuer, projectId, subprojectId, workflowitem);
    };

    const multichainNotifier: Workflowitem.CloseNotifier = workflowitem => {
      const notificationResource = Multichain.generateResources(
        projectId,
        subprojectId,
        workflowitem.id,
      );

      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(
          multichainClient,
          issuer,
          message,
          recipient,
          notificationResource,
        );

      const resolver: Notification.GroupResolver = groupId =>
        Group.getUsers(multichainClient, groupId);

      const closeNotification: Notification.WorkflowitemClosing = {
        workflowitemId: workflowitem.id,
        actingUser: closingUser.id,
        assignee: workflowitem.assignee,
      };

      return Notification.workflowitemClosed(closeNotification, {
        sender,
        resolver,
      });
    };

    return Workflowitem.close(closingUser, workflowitemId, {
      getOrdering: multichainOrderingReader,
      getWorkflowitems: multichainLister,
      closeWorkflowitem: multichainCloser,
      notify: multichainNotifier,
    });
  };
}

function multichainSubprojectToSubprojectSubproject(
  multichainSubproject: Multichain.Subproject,
): Subproject.Subproject {
  return {
    id: multichainSubproject.id,
    creationUnixTs: multichainSubproject.creationUnixTs,
    status: multichainSubproject.status,
    displayName: multichainSubproject.displayName,
    description: multichainSubproject.description,
    amount: multichainSubproject.amount,
    currency: multichainSubproject.currency,
    exchangeRate: multichainSubproject.currency,
    billingDate: multichainSubproject.currency,
    assignee: multichainSubproject.assignee,
    permissions: multichainSubproject.permissions,
    log: multichainSubproject.log,
  };
}

export function getPermissionList(multichainClient: MultichainClient): HTTP.AllPermissionsReader {
  return async (token: AuthToken) => {
    const user: Permission.User = { id: token.userId, groups: token.groups };

    const lister: Permission.PermissionsLister = async () => {
      const permissions: Multichain.Permissions = await Multichain.getGlobalPermissionList(
        multichainClient,
      );
      return permissions;
    };

    return Permission.list(user, { getAllPermissions: lister });
  };
}

export function grantPermission(multichainClient: MultichainClient): HTTP.GlobalPermissionGranter {
  return async (token: AuthToken, identity: string, intent: Intent) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const user: Permission.User = { id: token.userId, groups: token.groups };

    const lister: Permission.PermissionsLister = async () => {
      const permissions: Multichain.Permissions = await Multichain.getGlobalPermissionList(
        multichainClient,
      );
      return permissions;
    };

    const granter: Permission.PermissionsGranter = async (
      grantIntent: Intent,
      grantIdentity: string,
    ) => {
      return await Multichain.grantGlobalPermission(
        multichainClient,
        issuer,
        grantIdentity,
        grantIntent,
      );
    };
    return Permission.grant(user, identity, intent, {
      getAllPermissions: lister,
      grantPermission: granter,
    });
  };
}

export function grantAllPermissions(
  multichainClient: MultichainClient,
): HTTP.AllPermissionsGranter {
  return async (token: AuthToken, grantee: string) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const user: Permission.User = { id: token.userId, groups: token.groups };

    const lister: Permission.PermissionsLister = async () => {
      const permissions: Multichain.Permissions = await Multichain.getGlobalPermissionList(
        multichainClient,
      );
      return permissions;
    };

    const granter: Permission.PermissionsGranter = async (
      grantIntent: Intent,
      grantGrantee: string,
    ) => {
      return await Multichain.grantGlobalPermission(
        multichainClient,
        issuer,
        grantGrantee,
        grantIntent,
      );
    };
    return Permission.grantAll(user, grantee, {
      getAllPermissions: lister,
      grantPermission: granter,
    });
  };
}

export function updateWorkflowitem(multichainClient: MultichainClient): HTTP.WorkflowitemUpdater {
  return async (
    token: AuthToken,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
    updates: any,
  ) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const updatingUser: Workflowitem.User = { id: token.userId, groups: token.groups };

    // Get all unfiltered workflowitems from the blockchain
    const multichainLister: Workflowitem.ListReader = async () => {
      const workflowitemList: Multichain.Workflowitem[] = await Multichain.getWorkflowitemList(
        multichainClient,
        projectId,
        subprojectId,
      );
      return workflowitemList.map(Workflowitem.validateWorkflowitem);
    };
    const multichainUpdater: Workflowitem.Updater = async (workflowitem, data) => {
      Multichain.updateWorkflowitem(
        multichainClient,
        issuer,
        projectId,
        subprojectId,
        workflowitem,
        data,
      );
    };

    const multichainNotifier: Workflowitem.UpdateNotifier = (workflowitem, updatedData) => {
      const notificationResource = Multichain.generateResources(
        projectId,
        subprojectId,
        workflowitem.id,
      );

      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(
          multichainClient,
          issuer,
          message,
          recipient,
          notificationResource,
        );

      const resolver: Notification.GroupResolver = groupId =>
        Group.getUsers(multichainClient, groupId);

      const updateNotification: Notification.WorkflowitemUpdate = {
        workflowitemId: workflowitem.id,
        actingUser: updatingUser.id,
        assignee: workflowitem.assignee,
        updatedData,
      };

      return Notification.workflowitemUpdated(updateNotification, updatedData, {
        sender,
        resolver,
      });
    };

    return Workflowitem.update(updatingUser, workflowitemId, updates, {
      getWorkflowitems: multichainLister,
      updateWorkflowitem: multichainUpdater,
      notify: multichainNotifier,
    });
  };
}

export function revokePermission(multichainClient: MultichainClient): HTTP.GlobalPermissionRevoker {
  return async (token: AuthToken, recipient: string, intent: Intent) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const user: Permission.User = { id: token.userId, groups: token.groups };

    const lister: Permission.PermissionsLister = async () => {
      const permissions: Multichain.Permissions = await Multichain.getGlobalPermissionList(
        multichainClient,
      );
      return permissions;
    };

    const revoker: Permission.PermissionsRevoker = async (
      revokeIntent: Intent,
      revokeRecipient: string,
    ) => {
      return await Multichain.revokeGlobalPermission(
        multichainClient,
        issuer,
        revokeRecipient,
        revokeIntent,
      );
    };
    return Permission.revoke(user, recipient, intent, {
      getAllPermissions: lister,
      revokePermission: revoker,
    });
  };
}
