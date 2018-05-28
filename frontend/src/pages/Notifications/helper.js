export const intentMapping = ({ originalEvent, resources }) => {
  switch (originalEvent.intent) {
    case "subproject.assign": {
      const subproject = resources.find(resource => resource.type === "subproject");
      const resourceName = subproject.displayName || "";
      return `Subproject ${resourceName} was assigned to you ${
        resourceName ? "" : "(No permissions to see further details)"
      }`;
    }
    case "workflowitem.assign": {
      const workflowitem = resources.find(resource => resource.type === "workflowitem");
      const resourceName = workflowitem.displayName || "";
      return `Workflowitem ${resourceName} was assigned to you ${
        resourceName ? "" : "(No permissions to see further details)"
      }`;
    }
    case "project.assign":
      const project = resources.find(resource => resource.type === "project");
      const resourceName = project.displayName || "";
      return `Project ${resourceName} was assigned to you ${
        resourceName ? "" : "(No permissions to see further details)"
      }`;
    default:
      return "Intent not found";
  }
};

export const parseURI = ({ resources }) => {
  const project = resources.find(resource => resource.type === "project");
  const subproject = resources.find(resource => resource.type === "subproject");
  if (subproject) {
    return `/projects/${project.id}/${subproject.id}`;
  } else {
    return `/projects/${project.id}`;
  }
};

export const fetchRessourceName = (res, type) => {
  const r = res.find(v => v.type === type);
  if (r !== undefined) {
    return r.displayName || "Redacted";
  } else {
    return "-";
  }
};

export const hasAccess = res => res.reduce((acc, r) => acc && r.displayName !== undefined, true);
