export const FETCH_WORKFLOW_ITEMS = 'FETCH_WORKFLOW_ITEMS';
export const FETCH_WORKFLOW_ITEMS_SUCCESS = 'FETCH_WORKFLOW_ITEMS_SUCCESS';

export const SHOW_WORKFLOW_DIALOG = 'SHOW_WORKFLOW_DIALOG';

export const WORKFLOW_NAME = 'WORKFLOW_NAME';
export const WORKFLOW_AMOUNT = 'WORKFLOW_AMOUNT';
export const WORKFLOW_PURPOSE = 'WORKFLOW_PURPOSE';
export const WORKFLOW_ADDITIONAL_DATA = 'WORKFLOW_ADDITIONAL_DATA';
export const WORKFLOW_CURRENCY = 'WORKFLOW_CURRENCY';
export const WORKFLOW_STATE = 'WORKFLOW_State';
export const WORKFLOW_ASSIGNEE = 'WORKFLOW_ASSIGNEE';
export const CREATE_WORKFLOW = 'CREATE_WORKFLOW';
export const WORKFLOW_EDIT = 'WORKFLOW_EDIT';

export function fetchWorkflowItems(streamName) {
  return {
    type: FETCH_WORKFLOW_ITEMS,
    streamName: streamName
  }
}
export function showWorkflowDialog(show) {
  return {
    type: SHOW_WORKFLOW_DIALOG,
    show: show
  }
}

export function storeWorkflowName(name){

  return {
    type: WORKFLOW_NAME,
    name: name
  }
}

export function storeWorkflowAmount(amount){
  return {
    type: WORKFLOW_AMOUNT,
    amount: amount
  }
}

export function storeWorkflowCurrency(currency){
  return {
    type: WORKFLOW_CURRENCY,
    currency: currency
  }
}

export function storeWorkflowPurpose(purpose){
  return {
    type: WORKFLOW_PURPOSE,
    purpose: purpose
  }
}

export function storeWorkflowAdditionalData(addData){
  return{
    type: WORKFLOW_ADDITIONAL_DATA,
    addData: addData
  }
}

export function storeWorkflowAssignee(assignee){
  console.log('Assignee' +assignee)
  return{
    type: WORKFLOW_ASSIGNEE,
    assignee: assignee
  }
}
export function storeWorkflowState(state){
  return{
    type: WORKFLOW_STATE,
    assignee: state
  }
}

export function createWorkflowItem(stream, workflowName, amount, currency, purpose, addData, state, assignee){
  return{
    type:CREATE_WORKFLOW,
    stream:stream,
    workflowName: workflowName,
    amount: amount,
    currency: currency,
    purpose: purpose,
    addData: addData,
    assignee:assignee,
    state:state
  }
}
