import Intent from "./authz/intents";
import deepcopy from "./lib/deepcopy";
import { isNotEmpty } from "./lib/emptyChecks";
import { inheritDefinedProperties } from "./lib/inheritDefinedProperties";
import logger from "./lib/logger";
import * as Multichain from "./multichain";
import { asMapKey } from "./multichain/Client";
import { MultichainClient } from "./multichain/Client.h";
import { Event, throwUnsupportedEventVersion } from "./multichain/event";
import * as Liststreamkeyitems from "./multichain/responses/liststreamkeyitems";
import { AllProjectsReader, SingleProjectReader } from "./project";
import * as Project from "./project";

const projectSelfKey = "self";

export class MultichainRepository implements SingleProjectReader, AllProjectsReader {
  constructor(private readonly multichain: MultichainClient) {}

  public getProject(id: string): Promise<Project.Project> {
    return getProject(this.multichain, id);
  }

  public getProjectList(): Promise<Project.Project[]> {
    return getProjectList(this.multichain);
  }

  public assignProject(
    issuer: Multichain.Issuer,
    project: string,
    assignee: string,
  ): Promise<void> {
    return assignProject(this.multichain, issuer, project, assignee);
  }
}

async function assignProject(
  multichain: MultichainClient,
  issuer: Multichain.Issuer,
  projectId: string,
  assignee: string,
): Promise<void> {
  const intent: Intent = "project.assign";
  const event = {
    key: projectId,
    intent,
    createdBy: issuer.name,
    createdAt: new Date().toISOString(),
    dataVersion: 1,
    data: { identity: assignee },
  };

  const streamName = projectId;
  const streamItemKey = projectSelfKey;
  const streamItem = { json: event };

  const publishEvent = () => {
    logger.debug(`Publishing ${intent} to ${streamName}/${streamItemKey}`);
    return multichain
      .getRpcClient()
      .invoke("publish", streamName, streamItemKey, streamItem)
      .then(() => event);
  };

  return publishEvent().catch(err => {
    if (err.code === -708) {
      logger.debug(
        `The stream ${streamName} does not exist yet. Creating the stream and trying again.`,
      );
      // The stream does not exist yet. Create the stream and try again:
      return multichain
        .getOrCreateStream({ kind: "project", name: streamName })
        .then(() => publishEvent());
    } else {
      logger.error({ error: err }, `Publishing ${intent} failed.`);
      throw err;
    }
  });
}

async function getProject(multichain: MultichainClient, id: string): Promise<Project.Project> {
  const streamItems = await fetchStreamItems(multichain, id);
  let project: Project.Project | undefined;

  for (const item of streamItems) {
    const event = item.data.json as Event;
    if (project === undefined) {
      project = handleCreate(event);
      if (project === undefined) {
        throw Error(`Failed to read project: ${JSON.stringify(event)}.`);
      }
    } else {
      const hasProcessedEvent =
        applyUpdate(event, project) ||
        applyAssign(event, project) ||
        applyClose(event, project) ||
        applyGrantPermission(event, project) ||
        applyRevokePermission(event, project);
      if (!hasProcessedEvent) {
        throw Error(`Unexpected event: ${JSON.stringify(event)}.`);
      }
    }
  }

  if (project === undefined) {
    throw Error(`Failed to source project ${id}`);
  }

  return project;
}

async function getProjectList(multichain: MultichainClient): Promise<Project.Project[]> {
  const streamItems = await fetchStreamItems(multichain);
  const projectsMap = new Map<string, Project.Project>();

  for (const item of streamItems) {
    const event = item.data.json as Event;
    let project = projectsMap.get(asMapKey(item));
    if (project === undefined) {
      project = handleCreate(event);
      if (project === undefined) {
        throw Error(`Failed to read project: ${JSON.stringify(event)}.`);
      }
    } else {
      // We've already encountered this project, so we can apply operations on it.
      const hasProcessedEvent =
        applyUpdate(event, project) ||
        applyAssign(event, project) ||
        applyClose(event, project) ||
        applyGrantPermission(event, project) ||
        applyRevokePermission(event, project);
      if (!hasProcessedEvent) {
        throw Error(`Unexpected event: ${JSON.stringify(event)}.`);
      }
    }
    projectsMap.set(asMapKey(item), project);
  }

  return [...projectsMap.values()];
}

async function fetchStreamItems(
  multichain: MultichainClient,
  projectId?: string,
): Promise<Liststreamkeyitems.Item[]> {
  if (projectId !== undefined) {
    return multichain.v2_readStreamItems(projectId, projectSelfKey);
  } else {
    // This fetches all the streams, keeping only project streams; then fetches the
    // project-stream's self key, which includes the actual project data, as stream
    // items.
    const streams = await multichain.streams();
    const streamItemLists = await Promise.all(
      streams
        .filter(stream => stream.details.kind === "project")
        .map(stream => stream.name)
        .map(streamName =>
          multichain
            .v2_readStreamItems(streamName, projectSelfKey)
            .then(items =>
              items.map(item => {
                // Make it possible to associate the "self" key to the actual project later on:
                item.keys = [streamName, projectSelfKey];
                return item;
              }),
            )
            .catch(err => {
              logger.error(
                { error: err },
                `Failed to fetch '${projectSelfKey}' stream item from project stream ${streamName}`,
              );
              return null;
            }),
        ),
    ).then(lists => lists.filter(isNotEmpty));
    // Remove failed attempts and flatten into a single list of stream items:
    return streamItemLists.reduce((acc, x) => acc.concat(x), []);
  }
}

function handleCreate(event: Event): Project.Project | undefined {
  if (event.intent !== "global.createProject") return undefined;
  switch (event.dataVersion) {
    case 1: {
      const { project, permissions } = event.data;
      const values = { ...deepcopy(project), permissions: deepcopy(permissions) };
      return Project.validateProject(values);
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyUpdate(event: Event, project: Project.Project): true | undefined {
  if (event.intent !== "project.update") return;
  switch (event.dataVersion) {
    case 1: {
      inheritDefinedProperties(project, event.data);
      Project.validateProject(project);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyAssign(event: Event, project: Project.Project): true | undefined {
  if (event.intent !== "project.assign") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity } = event.data;
      project.assignee = identity;
      Project.validateProject(project);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyClose(event: Event, project: Project.Project): true | undefined {
  if (event.intent !== "project.close") return;
  switch (event.dataVersion) {
    case 1: {
      project.status = "closed";
      Project.validateProject(project);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyGrantPermission(event: Event, project: Project.Project): true | undefined {
  if (event.intent !== "project.intent.grantPermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      Project.grantProjectPermission(project, identity, intent);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}

function applyRevokePermission(event: Event, project: Project.Project): true | undefined {
  if (event.intent !== "project.intent.revokePermission") return;
  switch (event.dataVersion) {
    case 1: {
      const { identity, intent } = event.data;
      Project.revokeProjectPermission(project, identity, intent);
      return true;
    }
  }
  throwUnsupportedEventVersion(event);
}
