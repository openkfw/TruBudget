export const FETCH_STREAM_ITEMS = 'FETCH_STREAM_ITEMS';
export const FETCH_STREAM_ITEMS_SUCCESS = 'FETCH_STREAM_ITEMS_SUCCESS';

export const SHOW_WORKFLOW_DIALOG = 'SHOW_WORKFLOW_DIALOG';
export const SHOW_WORKFLOW_DIALOG_SUCCESS = 'SHOW_WORKFLOW_DIALOG_SUCCESS';

export const CREATE_SUBPROJECT_ITEM = 'CREATE_SUBPROJECT_ITEM';
export const CREATE_SUBPROJECT_ITEM_SUCCESS = 'CREATE_SUBPROJECT_ITEM_SUCCESS';

export function fetchStreamItems(streamName) {
  return {
    type: FETCH_STREAM_ITEMS,
    streamName: streamName
  }
}

export function createSubProjectItem(parentName, subProjectName) {
  return {
    type: CREATE_SUBPROJECT_ITEM,
    parentName: parentName,
    subProjectName: subProjectName
  }
}

export function showWorkflowDialog(show) {
  return {
    type: SHOW_WORKFLOW_DIALOG,
    show: show
  }
}
