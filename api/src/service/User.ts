export interface User {
  id: string;
  groups: string[];
}

export function userIdentities({ id, groups }: User): string[] {
  return [id].concat(groups);
}
