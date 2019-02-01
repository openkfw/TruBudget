import { randomBytes } from "crypto";
import deepcopy from "../lib/deepcopy";
import { isEmpty } from "../lib/emptyChecks";
import {
  isProjectAssignable,
  isProjectUpdateable,
  isProjectVisibleTo,
  Project,
  ScrubbedProject,
  scrubHistory,
} from "./Project";
import { User } from "./User";

import Intent from "../authz/intents";
import { isNonemptyString, isUserOrUndefined, value } from "../lib/validation";
import * as Permission from "./Permission";
import { CreateData, isProjectCreateable } from "./Project";

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

export type PermissionListReader = () => Promise<Permission.Permissions>;

export type Creator = (project: Project) => Promise<void>;

export type Assigner = (projectId: string, assignee: string) => Promise<void>;

export type Updater = (projectId: string, update: Update) => Promise<void>;

export type AssignmentNotifier = (project: Project, actingUser: string) => Promise<void>;

export type UpdateNotifier = (
  updatedProject: Project,
  actingUser: string,
  update: Update,
) => Promise<void>;

export async function getOne(
  getProject: Reader,
  actingUser: User,
  projectId: string,
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

/**
 *
 * @param actingUser The requesting user.
 * @param rawCreateData The data used to create project. Internally mapped to Project.Project.
 */
export async function create(
  actingUser: User,
  rawCreateData: any,
  {
    getAllPermissions,
    getProject,
    createProject,
  }: {
    getAllPermissions: PermissionListReader;
    getProject: Reader;
    createProject: Creator;
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

  const getProjectDefaultPermissions = (userId: string): Permission.Permissions => {
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
    return intents.reduce(
      (obj, intent): Permission.Permissions => ({ ...obj, [intent]: [userId] }),
      {},
    );
  };

  const project: Project = {
    id: value("id", rawCreateData.id || randomString(), isNonemptyString),
    creationUnixTs: rawCreateData.creationUnixTs || new Date().getTime().toString(),
    status: value("status", rawCreateData.status, x => ["open", "closed"].includes(x), "open"),
    displayName: value("displayName", rawCreateData.displayName, isNonemptyString),
    description: value("description", rawCreateData.description, isNonemptyString),
    amount: value("amount", rawCreateData.amount, isNonemptyString),
    assignee: value("assignee", rawCreateData.assignee, isUserOrUndefined, actingUser.id),
    currency: value("currency", rawCreateData.currency, isNonemptyString).toUpperCase(),
    thumbnail: value("thumbnail", rawCreateData.thumbnail, x => typeof x === "string", ""),
    permissions: getProjectDefaultPermissions(actingUser.id),
    log: [],
  };

  // check if projectId already exists
  const existingProject = await getProject(project.id).catch(() => undefined);
  if (existingProject === undefined) {
    await createProject(project);
  } else {
    return Promise.reject(Error(`There already exists a project with projectId ${project.id}.`));
  }
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
