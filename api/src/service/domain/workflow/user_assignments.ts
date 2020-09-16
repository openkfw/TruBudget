import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

// HiddenAssignments gives information if the requested user has assignments,
// but the issuer has no permission to view the project, subproject or workflowitem
// where the requested users is assigned
export interface HiddenAssignments {
  hasHiddenProjects: boolean;
  hasHiddenSubprojects: boolean;
  hasHiddenWorkflowitems: boolean;
}
export interface UserAssignments {
  userId: string;
  projects?: Project.Project[];
  subprojects?: Subproject.Subproject[];
  workflowitems?: Workflowitem.Workflowitem[];
  hiddenAssignments?: HiddenAssignments;
}
