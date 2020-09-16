import { VError } from "verror";
import { isEmpty } from "../../../lib/emptyChecks";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as Result from "../../../result";
import * as UserAssignments from "./user_assignments";
import * as UserRecord from "../organization/user_record";
import Intent from "../../../authz/intents";
import { ServiceUser } from "../organization/service_user";
import { NotAuthorized } from "../errors/not_authorized";
import { Ctx } from "../../../lib/ctx";

export interface RequestData {
  userId: string;
}

interface SubprojectTrace {
  projectId: string;
}
interface WorkflowItemTrace {
  projectId: string;
  subprojectId: string;
}

interface Repository {
  getAllProjects(): Promise<Project.Project[]>;
  getSubprojects(projectId: string): Promise<Result.Type<Subproject.Subproject[]>>;
  getWorkflowitems(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
  getUser(userId: string): Promise<Result.Type<UserRecord.UserRecord>>;
}

export async function getUserAssignments(
  ctx: Ctx,
  userId: string,
  issuer: ServiceUser,
  issuerOrganization: string,
  repository: Repository,
): Promise<Result.Type<UserAssignments.UserAssignments>> {
  const assignedProjects: Project.Project[] = [];
  const assignedSubprojects: (Subproject.Subproject & SubprojectTrace)[] = [];
  const assignedWorkflowitems: (Workflowitem.Workflowitem & WorkflowItemTrace)[] = [];
  let hiddenAssignments: UserAssignments.HiddenAssignments = {
    hasHiddenProjects: false,
    hasHiddenSubprojects: false,
    hasHiddenWorkflowitems: false,
  };

  const intent: Intent = "global.listAssignments";
  const isRoot = issuer.id === "root";

  const userResult = await repository.getUser(userId);
  if (Result.isErr(userResult)) {
    return new VError(userResult, "Error getting user");
  }
  const user = userResult;

  // Check if revokee and issuer belong to the same organization
  if (user.organization !== issuerOrganization) {
    return new NotAuthorized({
      ctx,
      userId: issuer.id,
      intent,
    });
  }

  const projectIntents: Intent[] = ["project.viewSummary", "project.viewDetails"];
  const subprojectIntents: Intent[] = ["subproject.viewSummary", "subproject.viewDetails"];
  const workflowitemIntents: Intent[] = ["workflowitem.view"];

  let projects: Project.Project[] = [];
  try {
    projects = await repository.getAllProjects();
  } catch (error) {
    return new VError(error, "failed to fetch projects");
  }

  // Crawling through all open projects, subprojects and workflowitems:
  for await (const project of projects) {
    if (project.status === "closed") continue;
    if (project.assignee === userId) {
      if (!isRoot && !Project.permits(project, issuer, projectIntents)) {
        hiddenAssignments.hasHiddenProjects = true;
      } else assignedProjects.push(project);
    }
    const subprojects = await repository.getSubprojects(project.id);
    if (Result.isErr(subprojects)) {
      return new VError(subprojects, "failed to fetch subprojects");
    }

    for await (const subproject of subprojects) {
      if (subproject.status === "closed") continue;
      if (subproject.assignee === userId) {
        if (!isRoot && !Subproject.permits(subproject, issuer, subprojectIntents)) {
          hiddenAssignments.hasHiddenSubprojects = true;
        } else assignedSubprojects.push({ ...subproject, projectId: project.id });
      }
      const workflowitems = await repository.getWorkflowitems(project.id, subproject.id);
      if (Result.isErr(workflowitems)) {
        return new VError(workflowitems, "failed to fetch workflowitems");
      }

      for await (const workflowitem of workflowitems) {
        if (workflowitem.status === "closed") continue;
        if (workflowitem.assignee === userId) {
          if (!isRoot && !Workflowitem.permits(workflowitem, issuer, workflowitemIntents)) {
            hiddenAssignments.hasHiddenWorkflowitems = true;
          } else
            assignedWorkflowitems.push({
              ...workflowitem,
              projectId: project.id,
              subprojectId: subproject.id,
            });
        }
      }
    }
  }

  const userAssignments: UserAssignments.UserAssignments = {
    userId,
    projects: assignedProjects,
    subprojects: assignedSubprojects,
    workflowitems: assignedWorkflowitems,
    hiddenAssignments,
  };

  if (hasAssignments(userAssignments)) {
    return userAssignments;
  } else {
    return { userId };
  }
}

export function toString(assignments: UserAssignments.UserAssignments): string {
  let projects: string = "";
  let subprojects: string = "";
  let workflowitems: string = "";
  let hiddenAssignments: string = "";

  if (assignments.projects !== undefined) {
    projects = assignments.projects.reduce((x: string, curr: Project.Project) => {
      return x + curr.displayName + ", ";
    }, "Assigned projects: ");
  }
  if (assignments.subprojects !== undefined) {
    subprojects = assignments.subprojects.reduce((x: string, curr: Subproject.Subproject) => {
      return x + curr.displayName + ", ";
    }, " Assigned subprojects: ");
  }
  if (assignments.workflowitems !== undefined) {
    workflowitems = assignments.workflowitems.reduce(
      (x: string, curr: Workflowitem.Workflowitem) => {
        return x + curr.displayName + ", ";
      },
      " Assigned workflowitems: ",
    );
  }
  if (assignments.hiddenAssignments !== undefined) {
    hiddenAssignments = "Redacted assignments: ";
    if (assignments.hiddenAssignments.hasHiddenProjects) {
      hiddenAssignments = hiddenAssignments + "one or more projects, ";
    }
    if (assignments.hiddenAssignments.hasHiddenSubprojects) {
      hiddenAssignments = hiddenAssignments + "one or more subprojects, ";
    }
    if (assignments.hiddenAssignments.hasHiddenWorkflowitems) {
      hiddenAssignments = hiddenAssignments + "one or more workflowitems";
    }
  }
  return projects + subprojects + workflowitems + hiddenAssignments;
}

export function hasAssignments(assignments: UserAssignments.UserAssignments): boolean {
  const hasHiddenAssignments =
    assignments.hiddenAssignments !== undefined &&
    (assignments.hiddenAssignments.hasHiddenProjects === true ||
      assignments.hiddenAssignments.hasHiddenSubprojects === true ||
      assignments.hiddenAssignments.hasHiddenWorkflowitems === true);

  return (
    !isEmpty(assignments.projects) ||
    !isEmpty(assignments.subprojects) ||
    !isEmpty(assignments.workflowitems) ||
    hasHiddenAssignments
  );
}
