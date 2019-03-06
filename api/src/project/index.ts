import { randomBytes } from "crypto";

import Intent from "../authz/intents";
import { Permissions } from "../authz/types";
import deepcopy from "../lib/deepcopy";
import { isEmpty, isNotEmpty } from "../lib/emptyChecks";
import logger from "../lib/logger";
import { isNonemptyString, isUserOrUndefined, value } from "../lib/validation";
import { isAllowedTo } from "./Permission";
import {
  CreateProjectInput,
  isProjectAssignable,
  isProjectCreateable,
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

interface ProjectedBudget {
  organization: string;
  value: string;
  currencyCode: string;
}

export interface Update {
  displayName?: string;
  description?: string;
  projectedBudgets?: ProjectedBudget[];
  thumbnail?: string;
}

export type ListReader = () => Promise<Project[]>;

export type PermissionsLister = (projectId: string) => Promise<Permissions>;

export type Granter = (projectId: string, grantee: string, intent: Intent) => Promise<void>;
export type GlobalPermissionsLister = () => Promise<Permissions>;

export type Creator = (project: Project) => Promise<void>;

export type CreationNotifier = (project: Project, actingUser: string) => Promise<void>;

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
 * @param createData The data used to create project. Internally mapped to Project.Project.
 */
export async function create(
  actingUser: User,
  createData: CreateProjectInput,
  {
    getAllPermissions,
    getProject,
    createProject,
    notify,
  }: {
    getAllPermissions: GlobalPermissionsLister;
    getProject: Reader;
    createProject: Creator;
    notify: CreationNotifier;
  },
): Promise<void> {
  const allPermissions = await getAllPermissions();
  if (!isProjectCreateable(allPermissions, actingUser)) {
    return Promise.reject(Error(`Identity ${actingUser.id} is not allowed to create a Project.`));
  }

  // Max. length of projectId is 32
  // By converting to hex, each byte is represented by 2 characters
  // Therefore it should be called with an input length of 16
  const randomString = (bytes = 16) => randomBytes(bytes).toString("hex");

  const getProjectDefaultPermissions = (userId: string): Permissions => {
    if (userId === "root") return {};

    const intents: Intent[] = [
      "project.viewSummary",
      "project.viewDetails",
      "project.assign",
      "project.update",
      "project.intent.listPermissions",
      "project.intent.grantPermission",
      "project.intent.revokePermission",
      "project.createSubproject",
      "project.viewHistory",
      "project.close",
    ];
    return intents.reduce((obj, intent): Permissions => ({ ...obj, [intent]: [userId] }), {});
  };

  const project: Project = {
    id: value("id", createData.id || randomString(), isNonemptyString),
    creationUnixTs: createData.creationUnixTs || new Date().getTime().toString(),
    status: value("status", createData.status, x => ["open", "closed"].includes(x), "open"),
    displayName: value("displayName", createData.displayName, isNonemptyString),
    description: value("description", createData.description, isNonemptyString),
    assignee: value("assignee", createData.assignee, isUserOrUndefined, actingUser.id),
    // TODO: check correct form of this
    projectedBudgets: value("projectedBudgets", createData.projectedBudgets, isNotEmpty, []),
    thumbnail: value("thumbnail", createData.thumbnail, x => typeof x === "string", ""),
    permissions: getProjectDefaultPermissions(actingUser.id),
    log: [],
  };

  // check if projectId already exists
  try {
    await getProject(project.id);
    return Promise.reject(Error(`There already exists a project with projectId ${project.id}.`));
  } catch (_) {
    logger.debug(`Project - Create: Creating new project with id ${project.id}`, project);
    await createProject(project);
    await notify(project, actingUser.id);
  }
}

/**
 *
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
  // TODO check if grantee does exist
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
    "projectedBudgets",
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
