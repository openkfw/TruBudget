export const FETCH_STREAM_ITEMS = 'FETCH_STREAM_ITEMS';
export const FETCH_STREAM_ITEMS_SUCCESS = 'FETCH_STREAM_ITEMS_SUCCESS';

export const OPEN_WORKFLOW_DIALOG = 'OPEN_WORKFLOW_DIALOG';
export const OPEN_WORKFLOW_DIALOG_SUCCESS = 'OPEN_WORKFLOW_DIALOG_SUCCESS';
export const CLOSE_WORKFLOW_DIALOG = 'OPEN_WORKFLOW_DIALOG';
export const CLOSE_WORKFLOW_DIALOG_SUCCESS = 'OPEN_WORKFLOW_DIALOG_SUCCESS';

export function fetchStreamItems(pathName) {
  console.log('Fetch Stream Items gets executed ' + pathName)
  return {
    type: FETCH_STREAM_ITEMS,
    pathName:pathName
  }
}
export function openWorkflowDialog() {
  return {
    type: OPEN_WORKFLOW_DIALOG,
  }
}

export function closeWorkflowDialog() {
  return {
    type: CLOSE_WORKFLOW_DIALOG,
  }
}
