export const FETCH_STREAM_ITEMS = 'FETCH_STREAM_ITEMS';
export const FETCH_STREAM_ITEMS_SUCCESS = 'FETCH_STREAM_ITEMS_SUCCESS';

export const SHOW_WORKFLOW_DIALOG = 'SHOW_WORKFLOW_DIALOG';
export const SHOW_WORKFLOW_DIALOG_SUCCESS = 'SHOW_WORKFLOW_DIALOG_SUCCESS';

export const CREATE_SUBPROJECT_ITEM = 'CREATE_SUBPROJECT_ITEM';
export const CREATE_SUBPROJECT_ITEM_SUCCESS = 'CREATE_SUBPROJECT_ITEM_SUCCESS';
export const SUBPROJECT_NAME = 'SUBPROJECT_NAME';
export const SUBPROJECT_AMOUNT = 'SUBPROJECT_AMOUNT';
export const SUBPROJECT_PURPOSE = 'SUBPROJECT_PURPOSE';
export const SUBPROJECT_CURRENCY = 'SUBPROJECT_CURRENCY';

export function fetchStreamItems(streamName) {
  return {
    type: FETCH_STREAM_ITEMS,
    streamName: streamName
  }
}

export function storeSubProjectName(name) {
  return {
    type: SUBPROJECT_NAME,
    name: name
  }
}

export function createSubProjectItem(parentName, subProjectName, subProjectAmount, subProjectPurpose,subProjectCurrency) {
  return {
    type: CREATE_SUBPROJECT_ITEM,
    parentName: parentName,
    subProjectName:subProjectName,
    subProjectAmount:subProjectAmount,
    subProjectPurpose:subProjectPurpose,
    subProjectCurrency: subProjectCurrency
  }
}

export function showWorkflowDialog(show) {
  return {
    type: SHOW_WORKFLOW_DIALOG,
    show: show
  }
}

export function storeSubProjectAmount(amount){
  return {
    type: SUBPROJECT_AMOUNT,
    amount: amount
  }
}

export function storeSubProjectCurrency(currency){
  return {
    type: SUBPROJECT_CURRENCY,
    currency: currency
  }
}

export function storeSubProjectPurpose(purpose){
  return {
    type:SUBPROJECT_PURPOSE,
    purpose: purpose
  }
}
