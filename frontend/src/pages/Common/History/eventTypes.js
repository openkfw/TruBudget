import strings from "../../../localizeStrings";

export const projectEventTypes = () => [
  { id: "project_created", displayName: strings.eventTypes.project_created },
  { id: "project_updated", displayName: strings.eventTypes.project_updated },
  { id: "project_assigned", displayName: strings.eventTypes.project_assigned },
  { id: "project_closed", displayName: strings.eventTypes.project_closed },
  { id: "project_permission_granted", displayName: strings.eventTypes.project_permission_granted },
  { id: "project_permission_revoked", displayName: strings.eventTypes.project_permission_revoked },
  { id: "project_projected_budget_updated", displayName: strings.eventTypes.project_projected_budget_updated },
  { id: "project_projected_budget_deleted", displayName: strings.eventTypes.project_projected_budget_deleted }
];

export const subprojectEventTypes = () => [
  { id: "subproject_created", displayName: strings.eventTypes.subproject_created },
  { id: "subproject_updated", displayName: strings.eventTypes.subproject_updated },
  { id: "subproject_assigned", displayName: strings.eventTypes.subproject_assigned },
  { id: "subproject_closed", displayName: strings.eventTypes.subproject_closed },
  { id: "subproject_permission_granted", displayName: strings.eventTypes.subproject_permission_granted },
  { id: "subproject_permission_revoked", displayName: strings.eventTypes.subproject_permission_revoked },
  { id: "subproject_projected_budget_updated", displayName: strings.eventTypes.subproject_projected_budget_updated },
  { id: "subproject_projected_budget_deleted", displayName: strings.eventTypes.subproject_projected_budget_deleted }
];

export const workflowitemEventTypes = () => [
  { id: "workflowitem_created", displayName: strings.eventTypes.workflowitem_created },
  { id: "workflowitem_updated", displayName: strings.eventTypes.workflowitem_updated },
  { id: "workflowitem_assigned", displayName: strings.eventTypes.workflowitem_assigned },
  { id: "workflowitem_closed", displayName: strings.eventTypes.workflowitem_closed },
  { id: "workflowitem_permission_granted", displayName: strings.eventTypes.workflowitem_permission_granted },
  { id: "workflowitem_permission_revoked", displayName: strings.eventTypes.workflowitem_permission_revoked },
  { id: "workflowitems_reordered", displayName: strings.eventTypes.workflowitems_reordered }
];

export default { projectEventTypes, subprojectEventTypes, workflowitemEventTypes };
