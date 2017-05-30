export const FETCH_WORKFLOW_ITEMS = 'FETCH_WORKFLOW_ITEMS';
export const FETCH_WORKFLOW_ITEMS_SUCCESS = 'FETCH_WORKFLOW_ITEMS_SUCCESS';

export const SHOW_WORKFLOW_DIALOG = 'SHOW_WORKFLOW_DIALOG';

export const WORKFLOW_NAME = 'WORKFLOW_NAME';
export const WORKFLOW_AMOUNT = 'WORKFLOW_AMOUNT';
export const WORKFLOW_PURPOSE = 'WORKFLOW_PURPOSE';
export const WORKFLOW_ADDITIONAL_DATA = 'WORKFLOW_ADDITIONAL_DATA';
export const WORKFLOW_CURRENCY = 'WORKFLOW_CURRENCY';
export const WORKFLOW_STATE = 'WORKFLOW_STATE';
export const WORKFLOW_ASSIGNEE = 'WORKFLOW_ASSIGNEE';
export const CREATE_WORKFLOW = 'CREATE_WORKFLOW';
export const CREATE_WORKFLOW_SUCCESS = 'CREATE_WORKFLOW_SUCCESS';
export const EDIT_WORKFLOW = 'EDIT_WORKFLOW';
export const EDIT_WORKFLOW_SUCCESS = 'EDIT_WORKFLOW_SUCCESS';
export const WORKFLOW_EDIT = 'WORKFLOW_EDIT';
export const WORKFLOW_STATE_ENABLED = 'WORKFLOW_STATE_ENABLED';
export const WORKFLOW_TXID = 'WORKFLOW_TXID';
export const SHOW_WORKFLOW_DETAILS = 'SHOW_WORKFLOW_DETAILS';
export const SET_WORKFLOW_CREATION_STEP = 'SET_WORKFLOW_CREATION_STEP';

export const UPDATE_WORKFLOW_SORT = 'UPDATE_WORKFLOW_SORT';
export const ENABLE_WORKFLOW_SORT = 'ENABLE_WORKFLOW_SORT';

export const OPEN_HISTORY = 'OPEN_HISTORY';
export const OPEN_HISTORY_SUCCESS = 'OPEN_HISTORY_SUCCESS';
export const FETCH_HISTORY = 'FETCH_HISTORY';
export const FETCH_HISTORY_SUCCESS = 'FETCH_HISTORY_SUCCESS';


export function showWorkflowDetails(show, txid) {
  return {
    type: SHOW_WORKFLOW_DETAILS,
    show,
    txid
  }
}

export function enableWorkflowSort(sortEnabled) {
  return {
    type: ENABLE_WORKFLOW_SORT,
    sortEnabled
  }
}

export function updateWorkflowSort(workflowItems) {
  return {
    type: UPDATE_WORKFLOW_SORT,
    workflowItems
  }
}

export function showHistory(show) {
  return {
    type: OPEN_HISTORY,
    show
  }
}

export function fetchWorkflowItems(streamName) {
  return {
    type: FETCH_WORKFLOW_ITEMS,
    streamName: streamName
  }
}

export function fetchHistoryItems(project) {
  return {
    type: FETCH_HISTORY,
    project
  }
}

export function showWorkflowDialog(show, editMode = false) {
  return {
    type: SHOW_WORKFLOW_DIALOG,
    show: show,
    editMode
  }
}

export function storeWorkflowName(name) {

  return {
    type: WORKFLOW_NAME,
    name: name
  }
}

export function storeWorkflowAmount(amount) {
  return {
    type: WORKFLOW_AMOUNT,
    amount: amount
  }
}

export function storeWorkflowCurrency(currency) {
  return {
    type: WORKFLOW_CURRENCY,
    currency: currency
  }
}

export function storeWorkflowPurpose(purpose) {
  return {
    type: WORKFLOW_PURPOSE,
    purpose: purpose
  }
}

export function storeWorkflowAdditionalData(addData) {
  return {
    type: WORKFLOW_ADDITIONAL_DATA,
    addData: addData
  }
}

export function storeWorkflowAssignee(assignee) {
  return {
    type: WORKFLOW_ASSIGNEE,
    assignee: assignee
  }
}
export function storeWorkflowState(state) {
  return {
    type: WORKFLOW_STATE,
    state: state
  }
}
export function disableWorkflowState(enabled) {
  return {
    type: WORKFLOW_STATE_ENABLED,
    enabled: enabled
  }
}

export function storeWorkflowTxid(txid) {
  return {
    type: WORKFLOW_TXID,
    txid
  }
}

export function createWorkflowItem(stream, workflowName, amount, currency, purpose, addData, state, assignee) {
  return {
    type: CREATE_WORKFLOW,
    stream: stream,
    workflowName: workflowName,
    amount: amount,
    currency: currency,
    purpose: purpose,
    addData: addData,
    assignee: assignee,
    state: state
  }
}

export function editWorkflowItem(stream, workflowName, amount, currency, purpose, addData, state, assignee, txid, previousState) {
  return {
    type: EDIT_WORKFLOW,
    stream: stream,
    workflowName: workflowName,
    amount: amount,
    currency: currency,
    purpose: purpose,
    addData: addData,
    assignee: assignee,
    state: state,
    txid,
    previousState
  }
}

export function setWorkflowCreationStep(step) {
  return {
    type: SET_WORKFLOW_CREATION_STEP,
    step
  }
}
