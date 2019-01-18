import uuid = require("uuid");

import Intent from "./authz/intents";
import { AuthToken } from "./authz/token";
import * as HTTP from "./httpd";
import logger from "./lib/logger";
import { ResourceType } from "./lib/resourceTypes";
import * as Multichain from "./multichain";
import { MultichainClient } from "./multichain/Client.h";
import * as MultichainGroupResolverAdapter from "./MultichainGroupResolverAdapter";
import { MultichainRepository } from "./MultichainRepository";
import * as Notification from "./notification";
import { GroupResolverPort } from "./notification";
import { NotificationResourceDescription } from "./notification/model/Notification";
import * as Project from "./project";

export class MultichainProjectAdapter implements HTTP.ProjectPort {
  constructor(
    private readonly multichainClient: MultichainClient,
    private readonly repo: MultichainRepository,
    private readonly projectService: Project.ProjectAPI,
    private readonly notificationService: Notification.NotificationAPI,
  ) {}

  public assignProject(token: AuthToken, projectId: string, assignee: string): Promise<void> {
    const issuer: Multichain.Issuer = { name: token.userId, address: token.address };
    const assigningUser: Project.User = { id: token.userId, groups: token.groups };

    const multichainAssigner: Project.ProjectAssigner = (project, selectedAssignee) =>
      this.repo.assignProject(issuer, project, selectedAssignee);

    const multichainNotifier: Project.AssignedNotifier = (project, assigner) => {
      const sender: Notification.Sender = (message, recipient) =>
        send(this.multichainClient, issuer, message, recipient);

      const resolver: Notification.GroupResolverPort = MultichainGroupResolverAdapter.create(
        this.multichainClient,
      );

      const subject: Notification.Project = {
        id: project.id,
        status: project.status,
        displayName: project.displayName,
        assignee: project.assignee!,
      };

      return this.notificationService.projectAssigned(sender, resolver, assigner, subject);
    };

    return this.projectService.assignProject(
      this.repo,
      multichainAssigner,
      multichainNotifier,
      assigningUser,
      projectId,
      assignee,
    );
  }
}

async function send(
  multichain: MultichainClient,
  issuer: Multichain.Issuer,
  message: Multichain.Event,
  recipient: string,
): Promise<void> {
  const notificationId = uuid();
  // TODO message.key is working for projects
  // TODO but we need to access projectId subprojectid and workflowitemid and build data.resources
  const projectId = message.key;
  const resources: NotificationResourceDescription[] = [
    {
      id: projectId,
      type: notificationTypeFromIntent(message.intent),
    },
  ];
  const intent = "notification.create";
  const event: Multichain.Event = {
    key: recipient,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: {
      notificationId,
      resources,
      isRead: false,
      originalEvent: message,
    },
  };

  const streamName = "notifications";

  const publishEvent = () => {
    logger.debug(`Publishing ${intent} to ${streamName}/${recipient}`);
    return multichain.getRpcClient().invoke("publish", streamName, recipient, {
      json: event,
    });
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      logger.debug(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "notifications", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: err }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
}

function notificationTypeFromIntent(intent: Intent): ResourceType {
  if (intent.startsWith("project.") || intent === "global.createProject") {
    return "project";
  } else if (intent.startsWith("subproject.") || intent === "project.createSubproject") {
    return "subproject";
  } else if (intent.startsWith("workflowitem.") || intent === "subproject.createWorkflowitem") {
    return "workflowitem";
  } else {
    throw Error(`Unknown ResourceType for intent ${intent}`);
  }
}
