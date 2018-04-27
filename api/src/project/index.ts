import { getAllowedIntents } from "../authz/index";
import Intent from "../authz/intents";
import { AuthToken } from "../authz/token";
import { AllowedUserGroupsByIntent, People } from "../authz/types";
import { MultichainClient, Resource } from "../multichain/Client.h";

/** The multichain-item key used to identify subprojects. */
const SUBPROJECTS_KEY = "subprojects";

export interface ProjectResource extends Resource {
  data: ProjectData;
}

export interface ProjectData {
  id: string;
  creationUnixTs: string;
  status: "open" | "done";
  displayName: string;
  description: string;
  amount: string;
  currency: string;
  thumbnail: string;
}

export interface ProjectDataWithIntents extends ProjectData {
  allowedIntents: Intent[];
}

const ensureStreamExists = async (
  multichain: MultichainClient,
  projectId: string
): Promise<void> => {
  await multichain.getOrCreateStream({
    kind: "project",
    name: projectId
  });
};

export const getPermissions = async (
  multichain: MultichainClient,
  projectId: string
): Promise<AllowedUserGroupsByIntent> => {
  const streamItem = await multichain.getValue(projectId, "self");
  return streamItem.resource.permissions;
};

export const grantPermission = async (
  multichain: MultichainClient,
  projectId: string,
  userId: string,
  intent: Intent
): Promise<void> => {
  const streamItem = await multichain.getValue(projectId, "self");
  const project = streamItem.resource;
  const permissionsForIntent: People = project.permissions[intent] || [];

  if (permissionsForIntent.includes(userId)) {
    // The given user is already permitted to execute the given intent.
    return;
  }
  permissionsForIntent.push(userId);

  project.permissions[intent] = permissionsForIntent;
  await multichain.setValue(projectId, streamItem.key, project);
};

export const revokePermission = async (
  multichain: MultichainClient,
  projectId: string,
  userId: string,
  intent: Intent
): Promise<void> => {
  const streamItem = await multichain.getValue(projectId, "self");
  const project = streamItem.resource;
  const permissionsForIntent: People = project.permissions[intent] || [];

  const userIndex = permissionsForIntent.indexOf(userId);
  if (userIndex === -1) {
    // The given user has no permissions to execute the given intent.
    // Note: a user could still belong to a group that has access rights!
    return;
  }
  // Remove the user from the array:
  permissionsForIntent.splice(userIndex, 1);

  project.permissions[intent] = permissionsForIntent;
  await multichain.setValue(projectId, streamItem.key, project);
};

export const create = async (
  multichain: MultichainClient,
  token: AuthToken,
  permissions: AllowedUserGroupsByIntent,
  data: {
    id: string;
    displayName: string;
    description: string;
    amount: string;
    currency: string;
    thumbnail: string;
  }
): Promise<void> => {
  const projectId = data.id;
  const creationUnixTs = Date.now().toString();
  const resource: ProjectResource = {
    data: {
      id: projectId,
      creationUnixTs,
      status: "open",
      displayName: data.displayName,
      description: data.description,
      amount: data.amount,
      currency: data.currency,
      thumbnail: data.thumbnail
    },
    log: [{ creationUnixTs, issuer: token.userId, action: "project_created" }],
    permissions
  };
  await ensureStreamExists(multichain, projectId);
  return multichain.setValue(projectId, ["self"], resource);
};

export const get = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string
): Promise<ProjectData> => {
  const streamItem = await multichain.getValue(projectId, "self");
  return streamItem.resource.data;
};

export const getForUser = async (
  multichain: MultichainClient,
  token: AuthToken,
  projectId: string
): Promise<ProjectDataWithIntents> => {
  const streamItem = await multichain.getValue(projectId, "self");
  const resource = streamItem.resource;
  return {
    ...resource.data,
    allowedIntents: await getAllowedIntents(token, resource.permissions)
  };
};

export const getAll = async (multichain: MultichainClient): Promise<ProjectResource[]> => {
  const streams = await multichain.streams();
  const resources = await Promise.all(
    streams
      .filter(stream => stream.details.kind === "project")
      .map(stream => stream.name)
      .map(streamName =>
        multichain
          .getValue(streamName, "self")
          .then(item => item.resource)
          .catch(err => {
            console.log(`Failed to fetch 'self' resource from project stream ${streamName}`);
            return null;
          })
      )
  );
  return resources.filter(x => x !== null) as ProjectResource[];
};

export const getAllForUser = async (
  multichain: MultichainClient,
  token: AuthToken
): Promise<ProjectDataWithIntents[]> => {
  const resources = await getAll(multichain);
  return Promise.all(
    resources.map(async resource => {
      return {
        ...resource.data,
        allowedIntents: await getAllowedIntents(token, resource.permissions)
      };
    })
  );
};

// export const replacePermissions = async (
//   multichain: MultichainClient,
//   projectId: string,
//   permissionsByIntent: AllowedUserGroupsByIntent
// ): Promise<void> => {
//   await ensureStreamExists(multichain, projectId);

//   let self: Resource = await multichain
//     .getValue(projectId, "self")
//     .then(x => x.resource)
//     .catch(err => {
//       if (err.kind === "NotFound") {
//         return { data: {}, log: [], permissions: {} };
//       } else {
//         throw err;
//       }
//     });

//   self.permissions = permissionsByIntent;

//   return multichain.setValue(projectId, ["self"], self);
// };
