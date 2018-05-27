export const FETCH_WORKFLOW_ITEMS = "FETCH_WORKFLOW_ITEMS";
export const FETCH_WORKFLOW_ITEMS_SUCCESS = "FETCH_WORKFLOW_ITEMS_SUCCESS";

export const SHOW_WORKFLOW_DIALOG = "SHOW_WORKFLOW_DIALOG";
export const CANCEL_WORKFLOW_DIALOG = "CANCEL_WORKFLOW_DIALOG";

export const WORKFLOW_NAME = "WORKFLOW_NAME";
export const WORKFLOW_TYPE = "WORKFLOW_TYPE";
export const WORKFLOW_APPROVAL_REQUIRED = "WORKFLOW_APPROVAL_REQUIRED";
export const WORKFLOW_AMOUNT = "WORKFLOW_AMOUNT";
export const WORKFLOW_AMOUNT_TYPE = "WORKFLOW_AMOUNT_TYPE";
export const WORKFLOW_PURPOSE = "WORKFLOW_PURPOSE";
export const WORKFLOW_ADDITIONAL_DATA = "WORKFLOW_ADDITIONAL_DATA";
export const WORKFLOW_CURRENCY = "WORKFLOW_CURRENCY";
export const WORKFLOW_STATUS = "WORKFLOW_STATUS";
export const WORKFLOW_ASSIGNEE = "WORKFLOW_ASSIGNEE";
export const CREATE_WORKFLOW = "CREATE_WORKFLOW";
export const CREATE_WORKFLOW_SUCCESS = "CREATE_WORKFLOW_SUCCESS";
export const EDIT_WORKFLOW = "EDIT_WORKFLOW";
export const EDIT_WORKFLOW_SUCCESS = "EDIT_WORKFLOW_SUCCESS";
export const WORKFLOW_EDIT = "WORKFLOW_EDIT";
export const WORKFLOW_TXID = "WORKFLOW_TXID";
export const SHOW_WORKFLOW_DETAILS = "SHOW_WORKFLOW_DETAILS";

export const UPDATE_WORKFLOW_SORT = "UPDATE_WORKFLOW_SORT";
export const ENABLE_WORKFLOW_SORT = "ENABLE_WORKFLOW_SORT";

export const POST_WORKFLOW_SORT = "POST_WORKFLOW_SORT";
export const POST_WORKFLOW_SORT_SUCCESS = "POST_WORKFLOW_SORT_SUCCESS";

export const SUBPROJECT_AMOUNT = "SUBPROJECT_AMOUNT";
export const OPEN_HISTORY = "OPEN_HISTORY";
export const OPEN_HISTORY_SUCCESS = "OPEN_HISTORY_SUCCESS";

export const FETCH_SUBPROJECT_HISTORY = "FETCH_SUBPROJECT_HISTORY";
export const FETCH_SUBPROJECT_HISTORY_SUCCESS = "FETCH_SUBPROJECT_HISTORY_SUCCESS";

export const ENABLE_BUDGET_EDIT = "ENABLE_BUDGET_EDIT";
export const POST_SUBPROJECT_EDIT = "POST_SUBPROJECT_EDIT";
export const POST_SUBPROJECT_EDIT_SUCCESS = "POST_SUBPROJECT_EDIT_SUCCESS";

export const WORKFLOW_CREATION_STEP = "WORKFLOW_CREATION_STEP";

export const FETCH_ALL_SUBPROJECT_DETAILS = "FETCH_ALL_SUBPROJECT_DETAILS";
export const FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS = "FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS";

export const SHOW_SUBPROJECT_PERMISSIONS = "SHOW_SUBPROJECT_PERMISSIONS";
export const HIDE_SUBPROJECT_PERMISSIONS = "HIDE_SUBPROJECT_PERMISSIONS";

export const FETCH_SUBPROJECT_PERMISSIONS = "FETCH_SUBPROJECT_PERMISSIONS";
export const FETCH_SUBPROJECT_PERMISSIONS_SUCCESS = "FETCH_SUBPROJECT_PERMISSIONS_SUCCESS";

export const GRANT_SUBPROJECT_PERMISSION = "GRANT_SUBPROJECT_PERMISSION";
export const GRANT_SUBPROJECT_PERMISSION_SUCCESS = "GRANT_SUBPROJECT_PERMISSION_SUCCESS";

export const SHOW_WORKFLOWITEM_PERMISSIONS = "SHOW_WORKFLOWITEM_PERMISSIONS";
export const HIDE_WORKFLOWITEM_PERMISSIONS = "HIDE_WORKFLOWITEM_PERMISSIONS";

export const FETCH_WORKFLOWITEM_PERMISSIONS = "FETCH_WORKFLOWITEM_PERMISSIONS";
export const FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS = "FETCH_WORKFLOWITEM_PERMISSIONS_SUCCESS";

export const GRANT_WORKFLOWITEM_PERMISSION = "GRANT_WORKFLOWITEM_PERMISSION";
export const GRANT_WORKFLOWITEM_PERMISSION_SUCCESS = "GRANT_WORKFLOWITEM_PERMISSION_SUCCESS";

export const ASSIGN_WORKFLOWITEM = "ASSIGN_WORKFLOWITEM";
export const ASSIGN_WORKFLOWITEM_SUCCESS = "ASSIGN_WORKFLOWITEM_SUCCESS";

export const ASSIGN_SUBPROJECT = "ASSIGN_SUBPROJECT";
export const ASSIGN_SUBPROJECT_SUCCESS = "ASSIGN_SUBPROJECT_SUCCESS";

export const CLOSE_WORKFLOWITEM = "CLOSE_WORKFLOWITEM";
export const CLOSE_WORKFLOWITEM_SUCCESS = "CLOSE_WORKFLOWITEM_SUCCESS";

export const SHOW_WORKFLOW_ASSIGNEES = "SHOW_WORKFLOW_ASSIGNEES";
export const HIDE_WORKFLOW_ASSIGNEES = "HIDE_WORKFLOW_ASSIGNEES";

export const SHOW_SUBPROJECT_ASSIGNEES = "SHOW_SUBPROJECT_ASSIGNEES";
export const HIDE_SUBPROJECT_ASSIGNEES = "HIDE_SUBPROJECT_ASSIGNEES";

export function fetchAllSubprojectDetails(projectId, subprojectId, showLoading = false) {
  return {
    type: FETCH_ALL_SUBPROJECT_DETAILS,
    projectId,
    subprojectId,
    showLoading
  };
}

export function fetchSubprojectHistory(projectId, subprojectId, showLoading = false) {
  return {
    type: FETCH_SUBPROJECT_HISTORY,
    projectId,
    subprojectId,
    showLoading
  };
}

export function showWorkflowItemAssignee(workflowId, assignee) {
  return {
    type: SHOW_WORKFLOW_ASSIGNEES,
    workflowId,
    assignee
  };
}

export function hideWorkflowAssignee() {
  return {
    type: HIDE_WORKFLOW_ASSIGNEES
  };
}

export function setCurrentStep(step) {
  return {
    type: WORKFLOW_CREATION_STEP,
    step
  };
}

export function showWorkflowDetails(show, txid) {
  return {
    type: SHOW_WORKFLOW_DETAILS,
    show,
    txid
  };
}

export function showSubProjectPermissions() {
  return {
    type: SHOW_SUBPROJECT_PERMISSIONS
  };
}

export function hideSubProjectPermissions() {
  return {
    type: HIDE_SUBPROJECT_PERMISSIONS
  };
}

export function showSubProjectAssignee(assignee) {
  return {
    type: SHOW_SUBPROJECT_ASSIGNEES,
    assignee
  };
}

export function hideSubProjectAssignee() {
  return {
    type: HIDE_SUBPROJECT_ASSIGNEES
  };
}

export function fetchSubProjectPermissions(projectId, subprojectId, showLoading = false) {
  return {
    type: FETCH_SUBPROJECT_PERMISSIONS,
    projectId,
    subprojectId,
    showLoading
  };
}

export function grantSubProjectPermission(projectId, subprojectId, intent, user, showLoading = false) {
  return {
    type: GRANT_SUBPROJECT_PERMISSION,
    projectId,
    subprojectId,
    intent,
    user,
    showLoading
  };
}

export function showWorkflowItemPermissions(wId) {
  return {
    type: SHOW_WORKFLOWITEM_PERMISSIONS,
    wId
  };
}

export function hideWorkflowItemPermissions() {
  return {
    type: HIDE_WORKFLOWITEM_PERMISSIONS
  };
}

export function fetchWorkflowItemPermissions(projectId, workflowitemId, showLoading = false) {
  return {
    type: FETCH_WORKFLOWITEM_PERMISSIONS,
    projectId,
    workflowitemId,
    showLoading
  };
}

export function grantWorkflowItemPermission(
  projectId,
  subprojectId,
  workflowitemId,
  intent,
  user,
  showLoading = false
) {
  return {
    type: GRANT_WORKFLOWITEM_PERMISSION,
    projectId,
    subprojectId,
    workflowitemId,
    intent,
    user,
    showLoading
  };
}

export function assignWorkflowItem(projectId, subprojectId, workflowitemId, assigneeId, showLoading = false) {
  return {
    type: ASSIGN_WORKFLOWITEM,
    projectId,
    subprojectId,
    workflowitemId,
    assigneeId
  };
}

export function assignSubproject(projectId, subprojectId, assigneeId, showLoading = false) {
  return {
    type: ASSIGN_SUBPROJECT,
    projectId,
    subprojectId,
    assigneeId
  };
}

export function enableSubProjectBudgetEdit(budgetEditEnabled) {
  return {
    type: ENABLE_BUDGET_EDIT,
    budgetEditEnabled
  };
}

export function enableWorkflowSort(sortEnabled) {
  return {
    type: ENABLE_WORKFLOW_SORT,
    sortEnabled
  };
}
export function postWorkflowSort(streamName, workflowItems, sortEnabled = false) {
  // Just the keys are necessary to update the sort on the backend
  const order = [];
  workflowItems.map(item => order.push(item.key));
  return {
    type: POST_WORKFLOW_SORT,
    streamName,
    order,
    sortEnabled
  };
}

export function updateWorkflowSortOnState(workflowItems) {
  return {
    type: UPDATE_WORKFLOW_SORT,
    workflowItems
  };
}

export function fetchWorkflowItems(streamName) {
  return {
    type: FETCH_WORKFLOW_ITEMS,
    streamName: streamName
  };
}

export function showWorkflowDialog(editMode = false) {
  return {
    type: SHOW_WORKFLOW_DIALOG,
    show: true,
    editMode
  };
}

export function onWorkflowDialogCancel(editMode) {
  return {
    type: CANCEL_WORKFLOW_DIALOG,
    show: false,
    editMode
  };
}

export function storeSubProjectAmount(amount) {
  return {
    type: SUBPROJECT_AMOUNT,
    amount: amount
  };
}

export function storeWorkflowName(name) {
  return {
    type: WORKFLOW_NAME,
    name: name
  };
}

export function storeWorkflowType(workflowType) {
  return {
    type: WORKFLOW_TYPE,
    workflowType
  };
}

export function isWorkflowApprovalRequired(approvalRequired) {
  return {
    type: WORKFLOW_APPROVAL_REQUIRED,
    approvalRequired
  };
}

export function storeWorkflowAmount(amount) {
  return {
    type: WORKFLOW_AMOUNT,
    amount
  };
}

export function storeWorkflowAmountType(amountType) {
  return {
    type: WORKFLOW_AMOUNT_TYPE,
    amountType
  };
}

export function storeWorkflowCurrency(currency) {
  return {
    type: WORKFLOW_CURRENCY,
    currency: currency
  };
}

export function storeWorkflowComment(comment) {
  return {
    type: WORKFLOW_PURPOSE,
    comment: comment
  };
}

export function storeWorkflowStatus(status) {
  return {
    type: WORKFLOW_STATUS,
    status: status
  };
}

export function storeWorkflowTxid(txid) {
  return {
    type: WORKFLOW_TXID,
    txid
  };
}

export function createWorkflowItem(
  projectId,
  subprojectId,
  { name, amount, amountType, currency, comment, status },
  documents
) {
  return {
    type: CREATE_WORKFLOW,
    projectId,
    subprojectId,
    displayName: name,
    amount: `${amount}`,
    amountType,
    currency,
    description: comment,
    documents,
    status
  };
}

export function editWorkflowItem(
  stream,
  key,
  { name, amount, amountType, currency, comment, status, txid, type, approvalRequired },
  documents,
  previousState
) {
  return {
    type: EDIT_WORKFLOW,
    stream: stream,
    key: key,
    workflowName: name,
    amount: amount,
    currency: currency,
    comment: comment,
    workflowType: type,
    state: status,
    amountType,
    documents,
    txid,
    previousState,
    approvalRequired
  };
}

export function postSubProjectEdit(parent, streamName, status, amount) {
  return {
    type: POST_SUBPROJECT_EDIT,
    parent,
    streamName,
    status,
    amount
  };
}

export function closeWorkflowItem(projectId, subprojectId, workflowitemId, showLoading = false) {
  return {
    type: CLOSE_WORKFLOWITEM,
    projectId,
    subprojectId,
    workflowitemId,
    showLoading
  };
}
