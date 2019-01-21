import { getAllowedIntents } from "./authz";
import { AuthToken } from "./authz/token";
import * as HTTP from "./httpd";
import * as Multichain from "./multichain";
import { MultichainClient } from "./multichain/Client.h";
import * as Group from "./multichain/groups";
import * as Notification from "./notification";
import * as Project from "./project";

export function getProject(multichainClient: MultichainClient): HTTP.ProjectReader {
  return async (token: AuthToken, projectId: string) => {
    const user: Project.User = { id: token.userId, groups: token.groups };

    const reader: Project.ProjectReader = async id => {
      const multichainProject: Multichain.Project = await Multichain.getProject(
        multichainClient,
        id,
      );
      return Project.validateProject(multichainProject);
    };

    const project: Project.Project = await Project.getAuthorizedProject(reader, user, projectId);

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

export function getProjectList(
  multichainClient: MultichainClient,
  projectService: Project.API,
): HTTP.AllProjectsReader {
  return async (token: AuthToken) => {
    const user: Project.User = { id: token.userId, groups: token.groups };

    const lister: Project.AllProjectsReader = async () => {
      const projectList: Multichain.Project[] = await Multichain.getProjectList(multichainClient);
      return projectList.map(Project.validateProject);
    };

    const projects = await projectService.getProjectList(lister, user);
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

    const multichainAssigner: Project.ProjectAssigner = (id, selectedAssignee) =>
      Multichain.writeProjectAssignedToChain(multichainClient, issuer, id, selectedAssignee);

    const multichainNotifier: Project.AssignedNotifier = (project, assigner) => {
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

    const reader: Project.ProjectReader = id => this.repo.getProject(id);

    return this.projectService.assignProject(
      reader,
      multichainAssigner,
      multichainNotifier,
      assigningUser,
      projectId,
      assignee,
    );
  };
}
