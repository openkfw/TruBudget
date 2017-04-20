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
  WORKFLOW_ASSIGNEE
} from './actions';

const defaultState = fromJS({
  workflowItems: [],
  showWorkflow: false,
  workflowName: '',
  workflowAmount: '',
  workflowCurrency: 'EUR',
  workflowAdditionalData: '',
  workflowPurpose: '',
  workflowState:'Open',
  workflowAssignee:'',
  disabledWorkflowState: true
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_WORKFLOW_ITEMS_SUCCESS:
      return state.set('workflowItems', action.workflowItems);
    case SHOW_WORKFLOW_DIALOG:
      return state.set('showWorkflow', action.show)
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
      return state.set('workflowState' , action.state)
    case WORKFLOW_ASSIGNEE:
      return state.set('workflowAssignee', action.assignee)
    case WORKFLOW_STATE_ENABLED:
      return state.set('disabledWorkflowState', action.enabled)
    default:
      return state
  }
}
