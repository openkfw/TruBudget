export const SET_TOTAL_WORKFLOWITEM_HISTORY_ITEM_COUNT = "SET_TOTAL_WORKFLOWITEM_HISTORY_ITEM_COUNT";
export const FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE = "FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE";
export const FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE_SUCCESS = "FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE_SUCCESS";

export function setTotalHistoryItemCount(count) {
  return {
    type: SET_TOTAL_WORKFLOWITEM_HISTORY_ITEM_COUNT,
    count
  };
}

export function fetchNextWorkflowitemHistoryPage(projectId, subprojectId, workflowitemId, showLoading = false) {
  return {
    type: FETCH_NEXT_WORKFLOWITEM_HISTORY_PAGE,
    projectId,
    subprojectId,
    workflowitemId,
    showLoading
  };
}
