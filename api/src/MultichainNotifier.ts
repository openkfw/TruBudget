import { AssertionError } from "assert";
import { v4 as uuid } from "uuid";

import Intent from "./authz/intents";
import { AuthToken } from "./authz/token";
import { NotifierCreator } from "./httpd";
import logger from "./lib/logger";
import { ResourceType } from "./lib/resourceTypes";
import { MultichainClient } from "./multichain/Client.h";
import { Event } from "./multichain/event";
import { Issuer } from "./MultichainRepository/Issuer";
import { GroupResolver, NotificationAPI, Sender } from "./notification";
import { Project as NotificationProject } from "./notification/Project";
import { ProjectNotifier } from "./project";
import { Project } from "./project/Project";

// tslint:disable-next-line:no-empty-interface
export interface Notifier extends ProjectNotifier {}

interface NotificationResourceDescription {
  id: string;
  type: ResourceType;
}
export class MultichainedNotifierCreator implements NotifierCreator {
  constructor(
    private readonly multichainClient: MultichainClient,
    private readonly resolver: GroupResolver,
    private readonly notificationAPI: NotificationAPI,
  ) {}

  public createNotifier(token: AuthToken): Notifier {
    const client = this.multichainClient;
    const issuer: Issuer = { name: token.userId, address: token.address };
    const sender: MultichainedSender = new MultichainedSender(client, issuer);
    const resolver = this.resolver;
    const notificationAPI = this.notificationAPI;
    const notifier: Notifier = new MultichainedNotifier(client, notificationAPI, resolver, sender);

    return notifier;
  }
}

class MultichainedSender implements Sender {
  constructor(
    private readonly multichainClient: MultichainClient,
    private readonly issuer: Issuer,
  ) {}

  public send(message: Event, recipient: string): Promise<void> {
    return send(this.multichainClient, this.issuer, message, recipient);
  }
}

class MultichainedNotifier implements Notifier {
  constructor(
    private readonly client: MultichainClient,
    private readonly notificationAPI: NotificationAPI,
    private readonly resolver: GroupResolver,
    private readonly sender: MultichainedSender,
  ) {}

  public projectAssigned(assigner: string, project: Project, assignee: string): Promise<void> {
    // TODO: do we need this check since fastify check for the required assignee?
    if (assignee === undefined) {
      throw new AssertionError({ message: "Assignee undefined" });
    }
    const p: NotificationProject = {
      id: project.id,
      status: project.status,
      displayName: project.displayName,
      assignee,
    };
    return this.notificationAPI.projectAssigned(this.sender, this.resolver, assigner, p);
  }
}

export async function send(
  multichain: MultichainClient,
  issuer: Issuer,
  message: Event,
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
  const event: Event = {
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
