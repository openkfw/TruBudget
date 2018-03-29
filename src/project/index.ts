import { ProjectWithPermissions, Project } from "./types";
import Sample from "./sample";

export const unwrap: (ProjectWithPermissions) => Project = p => p.project;

export const list: () => Array<ProjectWithPermissions> = () => Sample;
