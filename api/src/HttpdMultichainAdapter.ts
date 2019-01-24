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
import { AuthToken } from "./authz/token";
import * as HTTP from "./httpd";
import * as Multichain from "./multichain";
import { MultichainClient } from "./multichain/Client.h";
import * as Group from "./multichain/groups";
import * as Notification from "./notification";
import * as Project from "./project";
import * as Workflowitem from "./workflowitem";

export function getProject(multichainClient: MultichainClient): HTTP.ProjectReader {
  return async (token: AuthToken, projectId: string) => {
    const user: Project.User = { id: token.userId, groups: token.groups };

    const reader: Project.Reader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(
        multichainClient,
        id,
      );
      return Project.validateProject(multichainProjectToProjectProject(multichainProject));
    };

    const project: Project.ScrubbedProject = await Project.getOne(reader, user, projectId);

    const httpProject: HTTP.Project = {
      log: project.log.map(scrubbedEvent => {
        if (scrubbedEvent === null) return null;
        return {
          intent: scrubbedEvent.intent,
          snapshot: {
            displayName: scrubbedEvent.snapshot.displayName,
            permissions: scrubbedEvent.snapshot.permissions,
          },
        };
      }),
      allowedIntents: getAllowedIntents(Project.userIdentities(user), project.permissions),
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
    };

    return httpProject;
  };
}

export function getProjectList(multichainClient: MultichainClient): HTTP.AllProjectsReader {
  return async (token: AuthToken) => {
    const user: Project.User = { id: token.userId, groups: token.groups };

    const lister: Project.ListReader = async () => {
      const projectList: Multichain.Project[] = await Multichain.getProjectList(multichainClient);
      return projectList.map(multichainProject => {
        return Project.validateProject(multichainProjectToProjectProject(multichainProject));
      });
    };
    const projects: Project.ScrubbedProject[] = await Project.getAllVisible(user, {
      getAllProjects: lister,
    });
    return projects.map(project => ({
      log: project.log.map(scrubbedEvent => {
        if (scrubbedEvent === null) return null;
        return {
          intent: scrubbedEvent.intent,
          snapshot: {
            displayName: scrubbedEvent.snapshot.displayName,
            permissions: scrubbedEvent.snapshot.permissions,
          },
        };
      }),
      allowedIntents: getAllowedIntents(Project.userIdentities(user), project.permissions),
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

export function assignProject(multichainClient: MultichainClient): HTTP.ProjectAssigner {
  return async (token: AuthToken, projectId: string, assignee: string) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const assigningUser: Project.User = { id: token.userId, groups: token.groups };

    const multichainAssigner: Project.Assigner = (id, selectedAssignee) =>
      Multichain.writeProjectAssignedToChain(multichainClient, issuer, id, selectedAssignee);

    const multichainNotifier: Project.AssignmentNotifier = (project, actingUser) => {
      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(multichainClient, issuer, message, recipient);

      const resolver: Notification.GroupResolver = groupId =>
        Group.getUsers(multichainClient, groupId);

      const assignmentNotification: Notification.ProjectAssignment = {
        projectId: project.id,
        actingUser,
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

    return Project.assign(assigningUser, projectId, assignee, {
      getProject: reader,
      saveProjectAssignment: multichainAssigner,
      notify: multichainNotifier,
    });
  };
}

export function updateProject(multichainClient: MultichainClient): HTTP.ProjectUpdater {
  return async (token: AuthToken, projectId: string, update: object) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const user: Project.User = { id: token.userId, groups: token.groups };

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

    const multichainNotifier: Project.UpdateNotifier = (
      updatedProject,
      actingUser,
      projectUpdate,
    ) => {
      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(multichainClient, issuer, message, recipient);

      const resolver: Notification.GroupResolver = groupId =>
        Group.getUsers(multichainClient, groupId);

      const updateNotification: Notification.ProjectUpdate = {
        projectId: updatedProject.id,
        assignee: updatedProject.assignee,
        actingUser,
        update: projectUpdate,
      };

      return Notification.projectUpdated(updateNotification, {
        send: sender,
        resolveGroup: resolver,
      });
    };

    return Project.update(user, projectId, update, {
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
        intent: log.intent,
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
      const ordering: string[] = await Multichain.fetchWorkflowitemOrdering(
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
        user,
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
    })) as HTTP.Workflowitem[];
  };
}
