import { UserId, GroupId, People } from "../authz/types";

export interface Project {
  title: string;
}

// Permissions are specific to the entity they relate to..
export interface Permissions {
  view: People;
  del: People;
  addSubproject: People;
  delSubproject: People;
}

export interface ProjectWithPermissions {
  kind: "project";
  project: Project;
  permissions: Permissions;
}
