export interface Project {
  id: string;
  status: "open" | "closed";
  displayName: string;
  assignee: string;
}
