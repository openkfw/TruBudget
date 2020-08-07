import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";

export interface UserAssignments {
  userId: string;
  projects?: Project.Project[];
  subprojects?: Subproject.Subproject[];
  workflowitems?: Workflowitem.Workflowitem[];
}
