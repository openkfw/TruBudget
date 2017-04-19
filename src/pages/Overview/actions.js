export const FETCH_STREAMS = 'FETCH_STREAMS';
export const FETCH_STREAMS_SUCCESS = 'FETCH_STREAMS_SUCCESS';

export const CREATE_PROJECT = 'CREATE_PROJECT';
export const SHOW_WORKFLOW_DIALOG = 'SHOW_WORKFLOW_DIALOG'
export const PROJECT_NAME = 'PROJECT_NAME';
export const PROJECT_AMOUNT = 'PROJECT_AMOUNT';
export const PROJECT_PURPOSE = 'PROJECT_PURPOSE';
export const PROJECT_CURRENCY = 'PROJECT_CURRENCY';


export function fetchStreams() {
  return {
    type: FETCH_STREAMS,
  }
}

export function createProject(name, parent, amount, purpose, currency) {
  return {
    type: CREATE_PROJECT,
    name: name,
    parent: parent,
    amount: amount,
    purpose:purpose,
    currency: currency
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

export function storeProjectAmount(amount){
  return {
    type: PROJECT_AMOUNT,
    amount: amount
  }
}
export function storeProjectCurrency(currency){
  return {
    type: PROJECT_CURRENCY,
    currency: currency
  }
}

export function storeProjectPurpose(purpose){
  return {
    type:PROJECT_PURPOSE,
    purpose: purpose
  }
}
