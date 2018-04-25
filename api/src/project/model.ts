import { AllowedUserGroupsByIntent, UserId } from "../authz/types";
import {
  MultichainClient,
  Stream,
  StreamTxId,
  StreamBody,
  SubprojectOnChain,
  GlobalOnChain,
  ProjectOnChain
} from "../multichain";
import { findBadKeysInObject, isNonemptyString } from "../lib";
import { Project, ProjectStreamMetadata, ProjectResponse } from "./model.h";
import Intent from "../authz/intents";
import { getAllowedIntents, authorized } from "../authz/index";
import { AuthToken } from "../authz/token";
import { LogEntry } from "../multichain/Client.h";

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
  const permissions = await multichain.latestValuesForKey(stream.name, "permissions");
  return {
    stream,
    metadata: metadata[0],
    logs,
    permissions: permissions[0]
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

// TODO this needs to be refactored..
const replacePermissionsWithAllowedIntents = async (
  token: AuthToken,
  project: Project,
  multichain: MultichainClient
): Promise<ProjectResponse> => {
  const permissions = project.permissions;
  delete project.permissions;
  return {
    ...(project as any),
    allowedIntents: await getAllowedIntents(token, permissions || {}),
    subprojects: await SubprojectOnChain.getAllForUser(multichain, project.id, token)
  };
};

const isNotNull = x => x !== null;

export class ProjectModel {
  multichain: MultichainClient;

  constructor(multichain: MultichainClient) {
    this.multichain = multichain;
  }
  async list(token: AuthToken, authorized): Promise<ProjectResponse[]> {
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

    // Instead of passing the permissions as is, we return the intents the current user
    // is allowed to execute:
    return Promise.all(
      clearedProjects.map(
        async project => await replacePermissionsWithAllowedIntents(token, project, this.multichain)
      )
    );
  }

  async details(token: AuthToken, projectId, authorized): Promise<ProjectResponse> {
    const fakeStream = { name: projectId } as Stream;
    const project = await toProject(toProjectStream(this.multichain)(fakeStream));
    await authorized(project.permissions);
    // Instead of passing the permissions as is, we return the intents the current user
    // is allowed to execute:
    const response = await replacePermissionsWithAllowedIntents(token, project, this.multichain);
    return {
      ...response,
      subprojects: await SubprojectOnChain.getAllForUser(this.multichain, projectId, token)
    };
  }

  async grantPermissions(authorized, projectId: string, intentToGrant: Intent, targetUser: string) {
    const permissionsByIntent = await ProjectOnChain.getPermissions(this.multichain, projectId);
    await authorized(permissionsByIntent);
    const permissions = permissionsByIntent[intentToGrant] || [];
    if (permissions.indexOf(targetUser) === -1) {
      // Update permissions:
      permissions.push(targetUser);
      permissionsByIntent[intentToGrant] = permissions;
      await ProjectOnChain.replacePermissions(this.multichain, projectId, permissionsByIntent);
      return true;
    } else {
      // Permission already set.
      return false;
    }
  }

  async listPermissions(id, authorized) {
    const permissionsKey = "permissions";
    const permissionItem = await this.multichain.latestValuesForKey(id, "permissions");
    const existingPermissions = permissionItem[0];
    await authorized(existingPermissions);
    return existingPermissions;
  }

  async createProject(token: AuthToken, body, authorized, globalModel): Promise<string> {
    const expectedKeys = ["displayName", "amount", "currency"];
    // TODO sanitize input
    const badKeys = findBadKeysInObject(expectedKeys, isNonemptyString, body);
    if (badKeys.length > 0) throw { kind: "ParseError", badKeys };

    await authorized(await GlobalOnChain.getPermissions(this.multichain)); // throws if unauthorized

    const { userId } = token;
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
      initialLogEntry: { issuer: userId, action: "created_project" },
      permissions: getDefaultPermissions(userId)
    });

    console.log(`${userId} has created a new project (txid=${txid})`);
    return txid;
  }
}

const getDefaultPermissions = (userId: String): AllowedUserGroupsByIntent => {
  const defaultIntents: Object = {
    "project.viewSummary": [userId],
    "project.viewDetails": [userId],
    "project.assign": [userId],
    "project.intent.listPermissions": [userId],
    "project.intent.grantPermission": [userId],
    "project.intent.revokePermission": [userId],
    "project.createSubproject": [userId]
  };
  return defaultIntents;
};
