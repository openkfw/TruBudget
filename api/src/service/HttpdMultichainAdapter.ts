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
import { getAllowedIntents } from "../authz";
import { AuthToken } from "../authz/token";
import * as HTTP from "../httpd";
import * as Notification from "../notification";
import * as Project from "../project";
import * as Multichain from "../service";
import * as Group from "../service/groups";
import * as Workflowitem from "../workflowitem";

export function assignProject(conn: Multichain.ConnToken): HTTP.ProjectAssigner {
  return async (token: AuthToken, projectId: string, assignee: string) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const actingUser: Project.User = { id: token.userId, groups: token.groups };

    return Project.assign(actingUser, projectId, assignee, {
      getProject: async id => Project.validateProject(await Multichain.getProject(conn, id)),
      saveProjectAssignment: (id, selectedAssignee) =>
        Multichain.writeProjectAssignedToChain(conn, issuer, id, selectedAssignee),
      notify: async (project, user) => {
        const assignmentNotification: Notification.ProjectAssignment = {
          projectId: project.id,
          actingUser: user,
          assignee: project.assignee,
        };

        await Notification.projectAssigned(assignmentNotification, {
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
      await Multichain.closeWorkflowitem(conn, issuer, projectId, subprojectId, workflowitem);
    };

    const multichainNotifier: Workflowitem.CloseNotifier = async workflowitem => {
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

      await Notification.workflowitemClosed(closeNotification, {
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
    const multichainUpdater: Workflowitem.Updater = async (workflowitem, data) =>
      Multichain.updateWorkflowitem(conn, issuer, projectId, subprojectId, workflowitem, data);

    const multichainNotifier: Workflowitem.UpdateNotifier = async (workflowitem, updatedData) => {
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

      await Notification.workflowitemUpdated(updateNotification, updatedData, {
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

      await Notification.workflowitemAssigned(assignNotification, assignee, {
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
