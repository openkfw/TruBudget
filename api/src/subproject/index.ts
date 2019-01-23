import { isSubprojectVisibleTo, ScrubbedSubproject, scrubHistory, Subproject } from "./Subproject";
import { User } from "./User";

export * from "./Subproject";
export * from "./User";

/** Fetch all workflowitems for a given project. */
export type Lister = (projectId: string) => Promise<Subproject[]>;

export async function allVisible(
  actingUser: User,
  projectId: string,
  { getAllSubprojects }: { getAllSubprojects: Lister },
): Promise<ScrubbedSubproject[]> {
  const allSubprojects = await getAllSubprojects(projectId);
  const authorizedSubprojects = allSubprojects
    .filter(subproject => isSubprojectVisibleTo(subproject, actingUser))
    .map(subproject => scrubHistory(subproject, actingUser));
  return authorizedSubprojects;
}
