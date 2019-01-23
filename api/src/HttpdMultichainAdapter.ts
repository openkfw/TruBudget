import { getAllowedIntents } from "./authz";
import { AuthToken } from "./authz/token";
import * as HTTP from "./httpd";
import * as Multichain from "./multichain";
import { MultichainClient } from "./multichain/Client.h";
import * as Group from "./multichain/groups";
import * as Notification from "./notification";
import * as Project from "./project";
import * as Workflowitem from "./workflowitem";
import { getUserAndGroups } from "./authz/index";

export function getProject(multichainClient: MultichainClient): HTTP.ProjectReader {
  return async (token: AuthToken, projectId: string) => {
    const user: Project.User = { id: token.userId, groups: token.groups };

    const reader: Project.Reader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(
        multichainClient,
        id,
      );
      return Project.validateProject(multichainProject);
    };

    const project: Project.Project = await Project.getOne(reader, user, projectId);

    const httpProject: HTTP.Project = {
      // TODO Is `log` used on the frontend?
      log: [],
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
      return projectList.map(Project.validateProject);
    };

    const projects = await Project.getAllVisible(user, { getAllProjects: lister });
    return projects.map(project => ({
      // TODO Is `log` used on the frontend?
      log: [],
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

export function assignProject(
  multichainClient: MultichainClient,
  notificationService: Notification.NotificationAPI,
): HTTP.ProjectAssigner {
  return async (token: AuthToken, projectId: string, assignee: string) => {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const assigningUser: Project.User = { id: token.userId, groups: token.groups };

    const multichainAssigner: Project.Assigner = (id, selectedAssignee) =>
      Multichain.writeProjectAssignedToChain(multichainClient, issuer, id, selectedAssignee);

    const multichainNotifier: Project.AssignmentNotifier = (project, assigner) => {
      const sender: Notification.Sender = (message, recipient) =>
        Multichain.issueNotification(multichainClient, issuer, message, recipient);

      const resolver: Notification.GroupResolverPort = groupId =>
        Group.getUsers(multichainClient, groupId);

      const subject: Notification.Project = {
        id: project.id,
        status: project.status,
        displayName: project.displayName,
        assignee: project.assignee!,
      };

      return notificationService.projectAssigned(sender, resolver, assigner, subject);
    };

    const reader: Project.Reader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(
        multichainClient,
        id,
      );
      return Project.validateProject(multichainProject);
    };

    return Project.assign(assigningUser, projectId, assignee, {
      getProject: reader,
      saveProjectAssignment: multichainAssigner,
      notify: multichainNotifier,
    });
  };
}

export function getWorkflowitemList(
  multichainClient: MultichainClient,
): HTTP.AllWorkflowitemsReader {
  return async (token: AuthToken, projectId: string, subprojectId: string) => {
    console.log("In getWorkflowitemList / HTTPD");
    const user: Workflowitem.User = { id: token.userId, groups: token.groups };
    // Get Workflowitems from Multichain
    const orderingReader: Workflowitem.OrderingReader = async () => {
      const ordering: string[] = await Multichain.fetchWorkflowitemOrdering(
        multichainClient,
        projectId,
        subprojectId,
      );
      return ordering;
    };
    const lister: Workflowitem.ListReader = async () => {
      const workflowitemList: Multichain.Workflowitem[] = await Multichain.getWorkflowitemList(
        multichainClient,
        projectId,
        subprojectId,
        user,
      );
      return workflowitemList.map(Workflowitem.validateWorkflowitem);
    };

    // Filter workflowitems based on business logic (permission, ordering)
    const workflowitems = await Workflowitem.getAllVisible(user, {
      getAllWorkflowitems: lister,
      getWorkflowitemOrdering: orderingReader,
    });

    console.log("HERE COMES THE WORKFLOWITEM");
    console.log(workflowitems[0].permissions);

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
      allowedIntents: getAllowedIntents(Workflowitem.userIdentities(user), item.permissions),
    })) as HTTP.Workflowitem[];
    // return Promise.resolve(lister());
  };
}
