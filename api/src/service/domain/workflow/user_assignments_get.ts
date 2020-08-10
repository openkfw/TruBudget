import { VError } from "verror";
import * as Project from "./project";
import * as Subproject from "./subproject";
import * as Workflowitem from "./workflowitem";
import * as Result from "../../../result";
import * as UserAssignments from "./user_assignments";

interface Repository {
  getAllProjects(): Promise<Project.Project[]>;
  getSubprojects(projectId: string): Promise<Result.Type<Subproject.Subproject[]>>;
  getWorkflowitems(
    projectId: string,
    subprojectId: string,
  ): Promise<Result.Type<Workflowitem.Workflowitem[]>>;
}

export async function getUserAssignments(
  userId: string,
  repository: Repository,
): Promise<Result.Type<UserAssignments.UserAssignments>> {
  const assignedProjects: Project.Project[] = [];
  const assignedSubprojects: Subproject.Subproject[] = [];
  const assignedWorkflowitems: Workflowitem.Workflowitem[] = [];

  let projects: Project.Project[] = [];
  try {
    projects = await repository.getAllProjects();
  } catch (error) {
    return new VError(error, "failed to fetch projects");
  }

  for await (const project of projects) {
    if (project.status === "closed") continue;
    if (project.assignee === userId) {
      assignedProjects.push(project);
    }
    const subprojects = await repository.getSubprojects(project.id);
    if (Result.isErr(subprojects)) {
      return new VError(subprojects, "failed to fetch subprojects");
    }
    for await (const subproject of subprojects) {
      if (subproject.status === "closed") continue;
      if (subproject.assignee === userId) {
        assignedSubprojects.push(subproject);
      }
      const workflowitems = await repository.getWorkflowitems(project.id, subproject.id);
      if (Result.isErr(workflowitems)) {
        return new VError(workflowitems, "failed to fetch workflowitems");
      }
      for await (const workflowitem of workflowitems) {
        if (workflowitem.status === "closed") continue;
        if (workflowitem.assignee === userId) {
          assignedWorkflowitems.push(workflowitem);
        }
      }
    }
  }
  if (
    assignedProjects.length === 0 &&
    assignedSubprojects.length === 0 &&
    assignedWorkflowitems.length === 0
  ) {
    return { userId };
  } else {
    return {
      userId,
      projects: assignedProjects,
      subprojects: assignedSubprojects,
      workflowitems: assignedWorkflowitems,
    };
  }
}

export function toString(assignments: UserAssignments.UserAssignments): string {
  let projects: string = "";
  let subprojects: string = "";
  let workflowitems: string = "";

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
  return projects + subprojects + workflowitems;
}

export function hasAssignments(assignments: UserAssignments.UserAssignments): boolean {
  return (
    assignments.projects !== undefined ||
    assignments.subprojects !== undefined ||
    assignments.workflowitems !== undefined
  );
}
