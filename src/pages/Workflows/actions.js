export const FETCH_WORKFLOW_ITEMS = 'FETCH_WORKFLOW_ITEMS';
export const FETCH_WORKFLOW_ITEMS_SUCCESS = 'FETCH_WORKFLOW_ITEMS_SUCCESS';

export const SHOW_WORKFLOW_DIALOG = 'SHOW_WORKFLOW_DIALOG';
export const HIDE_WORKFLOW_DIALOG = 'HIDE_WORKFLOW_DIALOG';

export const WORKFLOW_NAME = 'WORKFLOW_NAME';
export const WORKFLOW_TYPE = 'WORKFLOW_TYPE';
export const WORKFLOW_APPROVAL_REQUIRED = 'WORKFLOW_APPROVAL_REQUIRED';
export const WORKFLOW_AMOUNT = 'WORKFLOW_AMOUNT';
export const WORKFLOW_AMOUNT_TYPE = 'WORKFLOW_AMOUNT_TYPE';
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

export const UPDATE_WORKFLOW_SORT = 'UPDATE_WORKFLOW_SORT';
export const ENABLE_WORKFLOW_SORT = 'ENABLE_WORKFLOW_SORT';

export const POST_WORKFLOW_SORT = 'POST_WORKFLOW_SORT';
export const POST_WORKFLOW_SORT_SUCCESS = 'POST_WORKFLOW_SORT_SUCCESS';

export const SUBPROJECT_AMOUNT = 'SUBPROJECT_AMOUNT'
export const OPEN_HISTORY = 'OPEN_HISTORY';
export const OPEN_HISTORY_SUCCESS = 'OPEN_HISTORY_SUCCESS';
export const FETCH_HISTORY = 'FETCH_HISTORY';
export const FETCH_HISTORY_SUCCESS = 'FETCH_HISTORY_SUCCESS';

export const ENABLE_BUDGET_EDIT = 'ENABLE_BUDGET_EDIT';
export const POST_SUBPROJECT_EDIT = 'POST_SUBPROJECT_EDIT';
export const POST_SUBPROJECT_EDIT_SUCCESS = 'POST_SUBPROJECT_EDIT_SUCCESS';

export const WORKFLOW_CREATION_STEP = 'WORKFLOW_CREATION_STEP';

export function setCurrentStep(step) {
  return {
    type: WORKFLOW_CREATION_STEP,
    step
  }
}

export function showWorkflowDetails(show, txid) {
  return {
    type: SHOW_WORKFLOW_DETAILS,
    show,
    txid
  }
}

export function enableSubProjectBudgetEdit(budgetEditEnabled) {
  return {
    type: ENABLE_BUDGET_EDIT,
    budgetEditEnabled
  }
}

export function enableWorkflowSort(sortEnabled) {
  return {
    type: ENABLE_WORKFLOW_SORT,
    sortEnabled
  }
}
export function postWorkflowSort(streamName, workflowItems, sortEnabled = false) {
  // Just the keys are necessary to update the sort on the backend
  const order = []
  workflowItems.map((item) => order.push(item.key)
  )
  return {
    type: POST_WORKFLOW_SORT,
    streamName,
    order,
    sortEnabled
  }
}

export function updateWorkflowSortOnState(workflowItems) {
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

export function showWorkflowDialog(editMode = false) {
  return {
    type: SHOW_WORKFLOW_DIALOG,
    show: true,
    editMode
  }
}

export function hideWorkflowDialog(editMode) {
  return {
    type: HIDE_WORKFLOW_DIALOG,
    show: false,
    editMode
  }
}


export function storeSubProjectAmount(amount) {
  return {
    type: SUBPROJECT_AMOUNT,
    amount: amount
  }
}

export function storeWorkflowName(name) {

  return {
    type: WORKFLOW_NAME,
    name: name
  }
}
export function storeWorkflowType(workflowType) {
  return {
    type: WORKFLOW_TYPE,
    workflowType
  }
}

export function isWorkflowApprovalRequired(approvalRequired) {
  return {
    type: WORKFLOW_APPROVAL_REQUIRED,
    approvalRequired,
  }
}

export function storeWorkflowAmount(amount) {
  return {
    type: WORKFLOW_AMOUNT,
    amount
  }
}

export function storeWorkflowAmountType(amountType) {
  return {
    type: WORKFLOW_AMOUNT_TYPE,
    amountType
  }
}

export function storeWorkflowCurrency(currency) {
  return {
    type: WORKFLOW_CURRENCY,
    currency: currency
  }
}

export function storeWorkflowComment(comment) {
  return {
    type: WORKFLOW_PURPOSE,
    comment: comment
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

export function createWorkflowItem(stream, workflowName, amount, amountType, currency, comment, documents, state, assignee, workflowType, approvalRequired) {
  return {
    type: CREATE_WORKFLOW,
    stream: stream,
    workflowName: workflowName,
    amount: amount,
    amountType,
    currency: currency,
    comment: comment,
    documents,
    assignee: assignee,
    state: state,
    workflowType: workflowType,
    approvalRequired
  }
}

export function editWorkflowItem(stream, key, workflowName, amount, amountType, currency, comment, documents, state, assignee, txid, previousState, workflowType, approvalRequired) {
  return {
    type: EDIT_WORKFLOW,
    stream: stream,
    key: key,
    workflowName: workflowName,
    amount: amount,
    amountType,
    currency: currency,
    comment: comment,
    documents,
    assignee: assignee,
    state: state,
    txid,
    previousState,
    workflowType,
    approvalRequired
  }
}

export function postSubProjectEdit(parent, streamName, status, amount) {
  return {
    type: POST_SUBPROJECT_EDIT,
    parent,
    streamName,
    status,
    amount
  }
}
