export interface ServiceUser {
  id: string;
  groups: string[];
}

export function userIdentities({ id, groups }: ServiceUser): string[] {
  return [id].concat(groups);
}
