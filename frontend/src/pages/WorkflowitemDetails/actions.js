export const FETCH_WORKFLOWITEM_HISTORY = "FETCH_WORKFLOWITEM_HISTORY";
export const FETCH_WORKFLOWITEM_HISTORY_SUCCESS = "FETCH_WORKFLOWITEM_HISTORY_SUCCESS";

export function fetchWorkflowitemHistory(projectId, subprojectId, workflowitemId, offset, limit, showLoading = false) {
  return {
    type: FETCH_WORKFLOWITEM_HISTORY,
    projectId,
    subprojectId,
    workflowitemId,
    offset,
    limit,
    showLoading
  };
}
