import Intent from "../authz/intents";
import deepcopy from "../lib/deepcopy";
import { isEmpty } from "../lib/emptyChecks";
import { isAllowedTo, Permissions } from "./Permission";
import {
  isProjectAssignable,
  isProjectUpdateable,
  isProjectVisibleTo,
  Project,
  ScrubbedProject,
  scrubHistory,
} from "./Project";
import { User } from "./User";

export * from "./Project";
export * from "./User";

export type Reader = (id: string) => Promise<Project>;

export interface Update {
  displayName?: string;
  description?: string;
  amount?: string;
  currency?: string;
  thumbnail?: string;
}

export type ListReader = () => Promise<Project[]>;

export type PermissionsLister = (projectId: string) => Promise<Permissions>;

export type Granter = (projectId: string, grantee: string, intent: Intent) => Promise<void>;

export type Assigner = (projectId: string, assignee: string) => Promise<void>;

export type Updater = (projectId: string, update: Update) => Promise<void>;

export type AssignmentNotifier = (project: Project, actingUser: string) => Promise<void>;

export type UpdateNotifier = (
  updatedProject: Project,
  actingUser: string,
  update: Update,
) => Promise<void>;

export async function getOne(
  actingUser: User,
  projectId: string,
  { getProject }: { getProject: Reader },
): Promise<ScrubbedProject> {
  const project = await getProject(projectId);

  if (!isProjectVisibleTo(project, actingUser)) {
    return Promise.reject(
      Error(`Identity ${actingUser.id} is not allowed to see project ${projectId}.`),
    );
  }

  return scrubHistory(project, actingUser);
}

export async function getAllVisible(
  actingUser: User,
  { getAllProjects }: { getAllProjects: ListReader },
): Promise<ScrubbedProject[]> {
  const allProjects = await getAllProjects();
  const authorizedProjects = allProjects
    .filter(project => isProjectVisibleTo(project, actingUser))
    .map(project => scrubHistory(project, actingUser));
  return authorizedProjects;
}

export async function getPermissions(
  actingUser: User,
  projectId: string,
  {
    getProject,
    getProjectPermissions,
  }: { getProject: Reader; getProjectPermissions: PermissionsLister },
): Promise<Permissions> {
  const project = await getOne(actingUser, projectId, { getProject });
  if (!isAllowedTo("project.intent.listPermissions", project.permissions, actingUser)) {
    return Promise.reject(
      Error(`Identity ${actingUser.id} is not allowed to see permissions of project ${projectId}.`),
    );
  }
  return await getProjectPermissions(projectId);
}

/**
 *
 * @param actingUser The requesting user.
 * @param projectId ID of the affected project.
 * @param grantee The grantee the permission is granted to.
 * @param intent The permission which should be granted.
 */
export async function grantPermission(
  actingUser: User,
  projectId: string,
  grantee: string,
  intent: Intent,
  { getProject, grantProjectPermission }: { getProject: Reader; grantProjectPermission: Granter },
): Promise<void> {
  const project = await getProject(projectId);
  if (!isAllowedTo("project.intent.grantPermission", project.permissions, actingUser)) {
    return Promise.reject(
      Error(`Identity ${actingUser.id} is not allowed to see permissions of project ${projectId}.`),
    );
  }
  // check if grantee does exist
  return grantProjectPermission(projectId, grantee, intent);
}

/**
 *
 * @param actingUser The requesting user.
 * @param projectId ID of the affected project.
 * @param assignee The identity (user ID or group ID) to be assigned to the project.
 */
export async function assign(
  actingUser: User,
  projectId: string,
  assignee: string,
  {
    getProject,
    saveProjectAssignment,
    notify,
  }: {
    getProject: Reader;
    saveProjectAssignment: Assigner;
    notify: AssignmentNotifier;
  },
): Promise<void> {
  const project = await getProject(projectId);
  if (!isProjectAssignable(project, actingUser)) {
    return Promise.reject(
      Error(
        `Identity ${
          actingUser.id
        } is not allowed to re-assign project ${projectId} to ${assignee}.`,
      ),
    );
  }
  await saveProjectAssignment(projectId, assignee);
  const updatedProject = await getProject(projectId);
  await notify(updatedProject, actingUser.id);
}
/**
 *
 * @param actingUser The requesting user.
 * @param projectId ID of the affected project.
 * @param rawUpdate Describes only properties of project which should be updated
 */
export async function update(
  actingUser: User,
  projectId: string,
  rawUpdate: object,
  {
    getProject,
    updateProject,
    notify,
  }: {
    getProject: Reader;
    updateProject: Updater;
    notify: UpdateNotifier;
  },
): Promise<void> {
  if (isEmpty(rawUpdate)) {
    return Promise.resolve();
  }
  function inheritDefinedProperties(src: object, properties?: string[]): Update {
    const dst: Update = {};
    if (isEmpty(src)) return src;
    (properties || Object.keys(src)).forEach(prop => {
      const val = src[prop];
      if (isEmpty(val)) return;
      dst[prop] = deepcopy(val);
    });
    return dst;
  }
  // copy only properties defined in passed array remove every other property from rawUpdate
  // only projectId will be removed since fastify is removing other properties
  const checkedUpdate = inheritDefinedProperties(rawUpdate, [
    "displayName",
    "description",
    "amount",
    "currency",
    "thumbnail",
  ]);
  const project = await getProject(projectId);
  if (!isProjectUpdateable(project, actingUser)) {
    throw new Error(`Identity ${actingUser.id} is not allowed to update project ${projectId}.`);
  }
  await updateProject(projectId, checkedUpdate);
  const updatedProject = await getProject(projectId);
  await notify(updatedProject, actingUser.id, checkedUpdate);
}
