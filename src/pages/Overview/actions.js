export const FETCH_STREAMS = 'FETCH_STREAMS';
export const FETCH_STREAMS_SUCCESS = 'FETCH_STREAMS_SUCCESS';

export const CREATE_PROJECT= 'CREATE_PROJECT';
export const SHOW_WORKFLOW_DIALOG = 'SHOW_WORKFLOW_DIALOG'
export const PROJECT_NAME = 'PROJECT_NAME';

 export function fetchStreams() {
  return {
    type: FETCH_STREAMS,
  }
}

export function createProject(name, parent) {
  return {
    type: CREATE_PROJECT,
    name: name,
    parent: parent
  }
}
export function showWorkflowDialog(show) {
    return {
      type: SHOW_WORKFLOW_DIALOG,
      show: show
    }
  }
export function storeProjectName(name) {
    return {
      type: PROJECT_NAME,
      name: name
  }
}
