import { Project, ProjectWithPermissions } from "./types";

const projectsWithPermissions: Array<ProjectWithPermissions> = [
  {
    kind: "project",
    project: {
      title: "Project A"
    },
    permissions: {
      view: ["alice"],
      del: [],
      addSubproject: [],
      delSubproject: []
    }
  },
  {
    kind: "project",
    project: {
      title: "Project B"
    },
    permissions: {
      view: ["normalFolk"],
      del: [],
      addSubproject: [],
      delSubproject: []
    }
  },
  {
    kind: "project",
    project: {
      title: "Project C"
    },
    permissions: {
      view: ["approvers"],
      del: [],
      addSubproject: [],
      delSubproject: []
    }
  }
];

export const someProjects: Array<Project> = [
  { title: "Proj One" },
  { title: "Proj Two" },
  { title: "Proj Three" }
];

export const Multichain = {
  getStreams: () => [
    {
      details: "project",
      getStreamItems: () => someProjects
    }
  ]
};

export default {
  getAllProjects: () => someProjects
};
