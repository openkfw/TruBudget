import { isSubprojectVisibleTo, ScrubbedSubproject, scrubHistory, Subproject } from "./Subproject";
import { User } from "./User";

export * from "./Subproject";
export * from "./User";

/** Fetch all workflowitems for a given project. */
export type Lister = () => Promise<Subproject[]>;

export async function getAllVisible(
  actingUser: User,
  { getAllSubprojects }: { getAllSubprojects: Lister },
): Promise<ScrubbedSubproject[]> {
  const allSubprojects = await getAllSubprojects();
  const authorizedSubprojects = allSubprojects
    .filter(subproject => isSubprojectVisibleTo(subproject, actingUser))
    .map(subproject => scrubHistory(subproject, actingUser));
  return authorizedSubprojects;
}
