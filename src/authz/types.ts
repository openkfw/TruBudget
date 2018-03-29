import { Project, ProjectWithPermissions } from "../project/types";

export type UserId = string;
export type GroupId = string;
export type People = Array<UserId | GroupId>;
export interface UserGroupMapping {
  group: GroupId;
  users: Array<UserId>;
}

export type ProtectedResource = ProjectWithPermissions;
export type Resource = Project;
