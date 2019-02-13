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
import { Permissions } from "./authz/types";
import * as Permission from "./global";
import * as HTTP from "./httpd";
import * as Multichain from "./multichain";
import * as Group from "./multichain/groups";
import * as Notification from "./notification";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import { tellCacheWhatHappened } from "./multichain";

export function getProject(conn: Multichain.ConnToken): HTTP.ProjectReader {
  return async (token: AuthToken, projectId: string) => {
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    const project: Project.ScrubbedProject = await Project.getOne(actingUser, projectId, {
      getProject: async id => {
        return Project.validateProject(await Multichain.getAndCacheProject(conn, id));
      },
    });

    const subprojects: Subproject.ScrubbedSubproject[] = await Subproject.getAllVisible(
      actingUser,
      {
        getAllSubprojects: async () => {
          const list: Multichain.Subproject[] = await Multichain.getSubprojectList(conn, projectId);
          return list.map(Subproject.validateSubproject);
        },
      },
    );

    const httpProject: HTTP.ProjectAndSubprojects = {
      project: {
        log: project.log,
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
  conn: Multichain.ConnToken,
): HTTP.ProjectPermissionsReader {
  return async (token: AuthToken, projectId: string) => {
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    const reader: Project.Reader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(conn, id);
      return Project.validateProject(multichainProject);
    };

    const permissionsReader: Project.PermissionsLister = async id => {
      const permissions: Multichain.Permissions = await Multichain.getProjectPermissionList(
        conn,
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

export function grantProjectPermission(conn: Multichain.ConnToken): HTTP.ProjectPermissionsGranter {
  return async (token: AuthToken, projectId: string, grantee: string, intent: Intent) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    const reader: Project.Reader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(conn, id);
      return Project.validateProject(multichainProject);
    };

    const granter: Project.Granter = async (id, selectedGrantee, selectedIntent) => {
      await Multichain.grantProjectPermission(conn, issuer, id, selectedGrantee, selectedIntent);
    };

    return await Project.grantPermission(actingUser, projectId, grantee, intent, {
      getProject: reader,
      grantProjectPermission: granter,
    });
  };
}

export function getProjectList(conn: Multichain.ConnToken): HTTP.AllProjectsReader {
  return async (token: AuthToken) => {
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    const projects: Project.ScrubbedProject[] = await Project.getAllVisible(actingUser, {
      getAllProjects: async () => {
        const projectList: Multichain.Project[] = await Multichain.getAndCacheProjectList(conn);
        return projectList.map(Project.validateProject);
      },
    });

    return projects.map(project => ({
      log: project.log,
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

export function createProject(conn: Multichain.ConnToken): HTTP.ProjectCreator {
  return async (token: AuthToken, payload: HTTP.CreateProjectPayload) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const assigningUser: Project.User = { id: token.userId, groups: token.groups };

    const permissionLister: Permission.PermissionsLister = async () => {
      const permissions: Multichain.Permissions = await Multichain.getGlobalPermissionList(conn);
      return permissions;
    };

    const projectReader: Project.Reader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(conn, id);
      return Project.validateProject(multichainProject);
    };

    const creator: Project.Creator = async project => {
      Project.validateProject(project);

      const multichainProject: Multichain.Project = { ...project, log: [] };

      Multichain.createProjectOnChain(conn, issuer, multichainProject);
    };

    const input: Project.CreateProjectInput = payload;

    return Project.create(assigningUser, input, {
      getAllPermissions: permissionLister,
      getProject: projectReader,
      createProject: creator,
      notify: (project, _actingUser) => tellCacheWhatHappened(conn.cache, "global.createProject"),
    });
  };
}

export function assignProject(conn: Multichain.ConnToken): HTTP.ProjectAssigner {
  return async (token: AuthToken, projectId: string, assignee: string) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    return Project.assign(actingUser, projectId, assignee, {
      getProject: async id => Project.validateProject(await Multichain.getProject(conn, id)),
      saveProjectAssignment: (id, selectedAssignee) =>
        Multichain.writeProjectAssignedToChain(conn, issuer, id, selectedAssignee),
      notify: (project, user) => {
        const assignmentNotification: Notification.ProjectAssignment = {
          projectId: project.id,
          actingUser: user,
          assignee: project.assignee,
        };

        return Notification.projectAssigned(assignmentNotification, {
          send: (message, recipient) => {
            const notificationResource = Multichain.generateResources(project.id);
            return Multichain.issueNotification(
              conn,
              issuer,
              message,
              recipient,
              notificationResource,
            );
          },
          resolveGroup: groupId => Group.getUsers(conn, groupId),
        });
      },
    });
  };
}

export function updateProject(conn: Multichain.ConnToken): HTTP.ProjectUpdater {
  return async (token: AuthToken, projectId: string, update: object) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    return Project.update(actingUser, projectId, update, {
      getProject: async id => Project.validateProject(await Multichain.getProject(conn, id)),
      updateProject: async (id, data) => {
        const multichainUpdate: Multichain.ProjectUpdate = {};
        if (data.displayName !== undefined) multichainUpdate.displayName = data.displayName;
        if (data.description !== undefined) multichainUpdate.description = data.description;
        if (data.amount !== undefined) multichainUpdate.amount = data.amount;
        if (data.currency !== undefined) multichainUpdate.currency = data.currency;
        if (data.thumbnail !== undefined) multichainUpdate.thumbnail = data.thumbnail;
        await Multichain.updateProject(conn, issuer, id, multichainUpdate);
      },
      notify: (updatedProject, user, projectUpdate) => {
        const updateNotification: Notification.ProjectUpdate = {
          projectId: updatedProject.id,
          assignee: updatedProject.assignee,
          actingUser: user,
          update: projectUpdate,
        };
        return Notification.projectUpdated(updateNotification, {
          send: (message, recipient) => {
            const notificationResource = Multichain.generateResources(updatedProject.id);
            return Multichain.issueNotification(
              conn,
              issuer,
              message,
              recipient,
              notificationResource,
            );
          },
          resolveGroup: groupId => Group.getUsers(conn, groupId),
        });
      },
    });
  };
}

export function getWorkflowitemList(conn: Multichain.ConnToken): HTTP.AllWorkflowitemsReader {
  return async (token: AuthToken, projectId: string, subprojectId: string) => {
    const user: Workflowitem.User = { id: token.userId, groups: token.groups };

    // Get ordering of workflowitems from blockchain
    // If items are rearranged by user, the call returns an array of IDs in order
    const orderingReader: Workflowitem.OrderingReader = async () => {
      const ordering: string[] = await Multichain.getWorkflowitemOrdering(
        conn,
        projectId,
        subprojectId,
      );
      return ordering;
    };

    // Get all unfiltered workflowitems from the blockchain
    const lister: Workflowitem.ListReader = async () => {
      const workflowitemList: Multichain.Workflowitem[] = await Multichain.getWorkflowitemList(
        conn,
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

export function closeWorkflowitem(conn: Multichain.ConnToken): HTTP.WorkflowitemCloser {
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
        conn,
        projectId,
        subprojectId,
      );
      return ordering;
    };

    // Get all unfiltered workflowitems from the blockchain
    const multichainLister: Workflowitem.ListReader = async () => {
      const workflowitemList: Multichain.Workflowitem[] = await Multichain.getWorkflowitemList(
        conn,
        projectId,
        subprojectId,
      );
      return workflowitemList.map(Workflowitem.validateWorkflowitem);
    };
    const multichainCloser: Workflowitem.Closer = async workflowitem => {
      Multichain.closeWorkflowitem(conn, issuer, projectId, subprojectId, workflowitem);
    };

    const multichainNotifier: Workflowitem.CloseNotifier = workflowitem => {
      const notificationResource = Multichain.generateResources(
        projectId,
        subprojectId,
        workflowitem.id,
      );

      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(conn, issuer, message, recipient, notificationResource);

      const resolver: Notification.GroupResolver = groupId => Group.getUsers(conn, groupId);

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

export function getPermissionList(conn: Multichain.ConnToken): HTTP.AllPermissionsReader {
  return async (token: AuthToken) => {
    const user: Permission.User = { id: token.userId, groups: token.groups };

    const lister: Permission.PermissionsLister = async () => {
      const permissions: Permissions = await Multichain.getGlobalPermissionList(conn);
      return permissions;
    };

    return Permission.list(user, { getAllPermissions: lister });
  };
}

export function grantPermission(conn: Multichain.ConnToken): HTTP.GlobalPermissionGranter {
  return async (token: AuthToken, identity: string, intent: Intent) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const user: Permission.User = { id: token.userId, groups: token.groups };

    const lister: Permission.PermissionsLister = async () => {
      const permissions: Permissions = await Multichain.getGlobalPermissionList(conn);
      return permissions;
    };

    const granter: Permission.PermissionsGranter = async (
      grantIntent: Intent,
      grantIdentity: string,
    ) => {
      return await Multichain.grantGlobalPermission(conn, issuer, grantIdentity, grantIntent);
    };
    return Permission.grant(user, identity, intent, {
      getAllPermissions: lister,
      grantPermission: granter,
    });
  };
}

export function grantAllPermissions(conn: Multichain.ConnToken): HTTP.AllPermissionsGranter {
  return async (token: AuthToken, grantee: string) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const user: Permission.User = { id: token.userId, groups: token.groups };

    const lister: Permission.PermissionsLister = async () => {
      const permissions: Permissions = await Multichain.getGlobalPermissionList(conn);
      return permissions;
    };

    const granter: Permission.PermissionsGranter = async (
      grantIntent: Intent,
      grantGrantee: string,
    ) => {
      return await Multichain.grantGlobalPermission(conn, issuer, grantGrantee, grantIntent);
    };
    return Permission.grantAll(user, grantee, {
      getAllPermissions: lister,
      grantPermission: granter,
    });
  };
}

export function updateWorkflowitem(conn: Multichain.ConnToken): HTTP.WorkflowitemUpdater {
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
        conn,
        projectId,
        subprojectId,
      );
      return workflowitemList.map(Workflowitem.validateWorkflowitem);
    };
    const multichainUpdater: Workflowitem.Updater = async (workflowitem, data) => {
      Multichain.updateWorkflowitem(conn, issuer, projectId, subprojectId, workflowitem, data);
    };

    const multichainNotifier: Workflowitem.UpdateNotifier = (workflowitem, updatedData) => {
      const notificationResource = Multichain.generateResources(
        projectId,
        subprojectId,
        workflowitem.id,
      );

      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(conn, issuer, message, recipient, notificationResource);

      const resolver: Notification.GroupResolver = groupId => Group.getUsers(conn, groupId);

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

export function assignWorkflowitem(conn: Multichain.ConnToken): HTTP.WorkflowitemUpdater {
  return async (
    token: AuthToken,
    projectId: string,
    subprojectId: string,
    workflowitemId: string,
    newAssignee: string,
  ) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const assigningUser: Workflowitem.User = { id: token.userId, groups: token.groups };

    // Get all unfiltered workflowitems from the blockchain
    const multichainLister: Workflowitem.ListReader = async () => {
      const workflowitemList: Multichain.Workflowitem[] = await Multichain.getWorkflowitemList(
        conn,
        projectId,
        subprojectId,
      );
      return workflowitemList.map(Workflowitem.validateWorkflowitem);
    };
    const multichainAssigner: Workflowitem.Assigner = async (assignee, workflowitem) =>
      Multichain.assignWorkflowitem(conn, issuer, assignee, projectId, subprojectId, workflowitem);

    const multichainNotifier: Workflowitem.AssignNotifier = async (assignee, workflowitemID) => {
      const notificationResource = Multichain.generateResources(
        projectId,
        subprojectId,
        workflowitemID,
      );

      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(conn, issuer, message, recipient, notificationResource);

      const resolver: Notification.GroupResolver = groupId => Group.getUsers(conn, groupId);

      const assignNotification: Notification.WorkflowitemAssignment = {
        workflowitemId: workflowitemID,
        actingUser: assigningUser.id,
        assignee,
      };

      return Notification.workflowitemAssigned(assignNotification, assignee, {
        sender,
        resolver,
      });
    };

    return Workflowitem.assign(assigningUser, newAssignee, workflowitemId, {
      getWorkflowitems: multichainLister,
      assignWorkflowitem: multichainAssigner,
      notify: multichainNotifier,
    });
  };
}

export function revokePermission(conn: Multichain.ConnToken): HTTP.GlobalPermissionRevoker {
  return async (token: AuthToken, recipient: string, intent: Intent) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const user: Permission.User = { id: token.userId, groups: token.groups };

    const lister: Permission.PermissionsLister = async () => {
      const permissions: Permissions = await Multichain.getGlobalPermissionList(conn);
      return permissions;
    };

    const revoker: Permission.PermissionsRevoker = async (
      revokeIntent: Intent,
      revokeRecipient: string,
    ) => {
      return await Multichain.revokeGlobalPermission(conn, issuer, revokeRecipient, revokeIntent);
    };
    return Permission.revoke(user, recipient, intent, {
      getAllPermissions: lister,
      revokePermission: revoker,
    });
  };
}
