export const FETCH_STREAM_ITEMS = 'FETCH_STREAM_ITEMS';
export const FETCH_STREAM_ITEMS_SUCCESS = 'FETCH_STREAM_ITEMS_SUCCESS';

export const SHOW_WORKFLOW_DIALOG = 'SHOW_WORKFLOW_DIALOG';
export const SHOW_WORKFLOW_DIALOG_SUCCESS = 'SHOW_WORKFLOW_DIALOG_SUCCESS';


export function fetchStreamItems(streamName) {
  console.log('Fetch Stream Items gets executed ' + streamName)
  return {
    type: FETCH_STREAM_ITEMS,
    streamName: streamName
  }
}
export function showWorkflowDialog(show) {
  console.log('SHOW_WORKFLOW_DIALOG ' + show)
  return {
    type: SHOW_WORKFLOW_DIALOG,
    show: show
  }
}
