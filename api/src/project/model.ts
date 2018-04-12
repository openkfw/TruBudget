import { AllowedUserGroupsByIntent, UserId } from "../authz/types";
import { MultichainClient, Stream, StreamTxId, StreamBody } from "../multichain";
import { findBadKeysInObject, isNonemptyString } from "../lib";
import { LogEntry } from "../multichain/Client.h";
import { Project, ProjectStreamMetadata } from "./model.h";
import Intent from "../authz/intents";

interface ProjectStream {
  stream: Stream;
  metadata: ProjectStreamMetadata;
  logs: LogEntry[];
  permissions: AllowedUserGroupsByIntent;
}

const isProject = (stream: Stream): boolean => stream.details.kind === "project";

const toProjectStream = (multichain: MultichainClient) => async (
  stream: Stream
): Promise<ProjectStream> => {
  const metadata = await multichain.latestValuesForKey(stream.name, "_metadata");
  const logs = await multichain.latestValuesForKey(stream.name, "_log", 1000);
  const permissions = await multichain.latestValuesForKey(stream.name, "_permissions");
  return {
    stream,
    metadata: metadata[0],
    logs,
    permissions: permissions
  };
};

const toProject = async (futureProjectStream: Promise<ProjectStream>): Promise<Project> => {
  const projectStream = await futureProjectStream;
  return {
    id: projectStream.stream.name,
    ...projectStream.metadata,
    permissions: projectStream.permissions,
    logs: projectStream.logs
  };
};

const isNotNull = x => x !== null;

export class ProjectModel {
  multichain: MultichainClient;

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }

  async list(authorized): Promise<Project[]> {
    const streams: Stream[] = await this.multichain.streams();

    const projects = (await Promise.all(
      streams
        .filter(isProject)
        .map(toProjectStream(this.multichain))
        .map(toProject)
        .map(promise => promise.catch(err => null))
    )).filter(isNotNull) as Project[];

    const clearedProjects = (await Promise.all(
      projects.map(p =>
        authorized(p.permissions)
          .then(() => p)
          .catch(err => null)
      )
    )).filter(isNotNull) as Project[];

    return clearedProjects;
  }

  async details(projectId, authorized): Promise<Project> {
    const fakeStream = { name: projectId } as Stream;
    const project = await toProject(toProjectStream(this.multichain)(fakeStream));
    await authorized(project.permissions);
    return project;
  }

  async createProject(userId, body, authorized): Promise<string> {
    const expectedKeys = ["displayName", "amount", "currency"];
    // TODO sanitize input
    const badKeys = findBadKeysInObject(expectedKeys, isNonemptyString, body);
    if (badKeys.length > 0) throw { kind: "ParseError", badKeys };

    /* TODO root permissions */
    const rootPermissions = new Map<string, string[]>();
    await authorized(rootPermissions); // throws if unauthorized

    const issuer = "alice";
    const txid: StreamTxId = await this.multichain.getOrCreateStream({
      kind: "project",
      metadata: {
        displayName: body.displayName,
        creationUnixTs: new Date().getTime().toString(),
        amount: body.amount,
        currency: body.currency,
        status: "open",
        ...(body.description ? { description: body.description } : {}),
        ...(body.thumbnail ? { thumbnail: body.thumbnail } : {})
      },
      initialLogEntry: { issuer, action: "created_project" },
      permissions: getDefaultPermissions(userId)
    });

    console.log(`${issuer} has created a new project (txid=${txid})`);
    return txid;
  }
}

const getDefaultPermissions = (userId: UserId): AllowedUserGroupsByIntent => {
  const defaultIntents: Intent[] = [
    "project.viewSummary",
    "project.viewDetails",
    "project.assign",
    "project.intent.list",
    "project.intent.grantPermission",
    "project.intent.revokePermission"
  ];
  return defaultIntents.map(intent => [intent, [userId]]);
};
