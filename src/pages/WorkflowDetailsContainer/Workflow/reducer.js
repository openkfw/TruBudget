import {fromJS} from 'immutable';

import {
  FETCH_WORKFLOW_ITEMS_SUCCESS,
  SHOW_WORKFLOW_DIALOG,
  WORKFLOW_NAME,
  WORKFLOW_AMOUNT,
  WORKFLOW_PURPOSE,
  WORKFLOW_ADDITIONAL_DATA,
  WORKFLOW_CURRENCY,
  WORKFLOW_STATE_ENABLED,
  WORKFLOW_STATE,
  WORKFLOW_ASSIGNEE,
  WORKFLOW_TXID,
  CREATE_WORKFLOW_SUCCESS,
  EDIT_WORKFLOW_SUCCESS,
  SHOW_WORKFLOW_DETAILS
} from './actions';

const defaultState = fromJS({
  workflowItems: [],
  showWorkflow: false,
  workflowName: '',
  workflowAmount: '',
  workflowCurrency: 'EUR',
  workflowAdditionalData: '',
  workflowPurpose: '',
  workflowState: 'open',
  workflowAssignee: '',
  disabledWorkflowState: true,
  workflowTxid: '',
  editMode: false,
  showDetails: false,
  showDetailsItemId: '',
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_WORKFLOW_ITEMS_SUCCESS:
      return state.set('workflowItems', action.workflowItems);
    case SHOW_WORKFLOW_DIALOG:
      return state.merge({showWorkflow: action.show, editMode: action.editMode})
    case WORKFLOW_NAME:
      return state.set('workflowName', action.name)
    case WORKFLOW_AMOUNT:
      return state.set('workflowAmount', action.amount)
    case WORKFLOW_PURPOSE:
      return state.set('workflowPurpose', action.purpose)
    case WORKFLOW_ADDITIONAL_DATA:
      return state.set('workflowAdditionalData', action.addData)
    case WORKFLOW_CURRENCY:
      return state.set('workflowCurrency', action.currency)
    case WORKFLOW_STATE:
      return state.set('workflowState', action.state)
    case WORKFLOW_ASSIGNEE:
      return state.set('workflowAssignee', action.assignee)
    case WORKFLOW_STATE_ENABLED:
      return state.set('disabledWorkflowState', action.enabled)
    case WORKFLOW_TXID:
      return state.set('workflowTxid', action.txid)
    case CREATE_WORKFLOW_SUCCESS:
    case EDIT_WORKFLOW_SUCCESS:
      return state.merge({
        workflowName: defaultState.workflowName,
        workflowAmount: defaultState.workflowAmount,
        workflowCurrency: defaultState.workflowCurrency,
        workflowAdditionalData: defaultState.workflowAdditionalData,
        workflowPurpose: defaultState.workflowPurpose,
        workflowState: defaultState.workflowState,
        workflowAssignee: defaultState.workflowAssignee,
        disabledWorkflowState: defaultState.disabledWorkflowStatetrue,
        workflowTxid: defaultState.workflowTxid,
        editMode: defaultState.editMode
      });
    case SHOW_WORKFLOW_DETAILS:
      return state.merge({
        showDetails: action.show,
        showDetailsItemId: action.txid
      })
    default:
      return state
  }
}
