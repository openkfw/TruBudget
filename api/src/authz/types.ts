import { Project } from "../project/model";
import { Intent } from "./intents";

export type UserId = string;
export type GroupId = string;
export type People = Array<UserId | GroupId>;
export interface UserGroupMapping {
  group: GroupId;
  users: Array<UserId>;
}

export type Resource = Project;

/*
 * Read-only intents will fetch a list of resources, which will be filtered by the authz
 * layer according to the user's permissions on the respective resources.
 */
export interface ResourceList {
  kind: "resource list";
  intent: Intent;
  resources: Array<Resource>;
}

/*
 * Intents that cause changes are deferred until the permissions have been checked. This
 * is done by encapsulating the changes into a closure.
 */
export interface SideEffect {
  kind: "side effect";
  intent: Intent;
  action: () => void;
}

export type ModelResult = ResourceList | SideEffect;

type RawIntent = string;
export type AllowedUserGroupsByIntent = Map<RawIntent, People>;
