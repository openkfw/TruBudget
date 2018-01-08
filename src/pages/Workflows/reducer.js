import { fromJS } from 'immutable';

import { FETCH_WORKFLOW_ITEMS_SUCCESS, SHOW_WORKFLOW_DIALOG, WORKFLOW_NAME, WORKFLOW_AMOUNT, WORKFLOW_AMOUNT_TYPE, WORKFLOW_PURPOSE, WORKFLOW_CURRENCY, WORKFLOW_STATE_ENABLED, WORKFLOW_STATE, WORKFLOW_ASSIGNEE, WORKFLOW_TXID, CREATE_WORKFLOW_SUCCESS, EDIT_WORKFLOW_SUCCESS, SHOW_WORKFLOW_DETAILS, SET_WORKFLOW_CREATION_STEP, UPDATE_WORKFLOW_SORT, ENABLE_WORKFLOW_SORT, WORKFLOW_TYPE, ENABLE_BUDGET_EDIT, SUBPROJECT_AMOUNT, WORKFLOW_APPROVAL_REQUIRED } from './actions';

import { LOGOUT } from '../Login/actions';
import { fromAmountString } from '../../helper';

const defaultState = fromJS({
  workflowItems: [],
  subProjectDetails: {
    approver: [],
    assignee: [],
    bank: [],
  },
  showWorkflow: false,
  workflowName: '',
  workflowAmount: 0,
  workflowAmountType: 'na',
  workflowCurrency: '',
  workflowComment: '',
  workflowState: 'open',
  workflowAssignee: '',
  disabledWorkflowState: true,
  workflowTxid: '',
  editMode: false,
  showDetails: false,
  showDetailsItemId: '',
  showHistory: false,
  historyItems: [],
  creationStep: 0,
  workflowSortEnabled: false,
  showTransactionDialog: false,
  workflowType: 'workflow',
  workflowApprovalRequired: true,
  subProjectBudgetEditEnabled: false
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_WORKFLOW_ITEMS_SUCCESS:
      return state.merge({
        workflowItems: action.workflowItems.items,
        subProjectDetails: action.workflowItems.details
      });
    case SHOW_WORKFLOW_DIALOG:
      return state.merge({
        showWorkflow: action.show,
        editMode: action.editMode
      })
    case WORKFLOW_NAME:
      return state.set('workflowName', action.name)
    case WORKFLOW_TYPE:
      return state.set('workflowType', action.workflowType)
    case WORKFLOW_APPROVAL_REQUIRED:
      return state.set('workflowApprovalRequired', action.approvalRequired)
    case WORKFLOW_AMOUNT:
      return state.set('workflowAmount', fromAmountString(action.amount))
    case WORKFLOW_AMOUNT_TYPE:
      return state.set('workflowAmountType', action.amountType)
    case WORKFLOW_PURPOSE:
      return state.set('workflowComment', action.comment)
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
    case SUBPROJECT_AMOUNT:
      return state.set('subProjectAmount', action.amount)
    case CREATE_WORKFLOW_SUCCESS:
    case EDIT_WORKFLOW_SUCCESS:
      return state.merge({
        workflowName: defaultState.get('workflowName'),
        workflowAmount: defaultState.get('workflowAmount'),
        workflowAmountType: defaultState.get('workflowAmountType'),
        workflowCurrency: defaultState.get('workflowCurrency'),
        workflowComment: defaultState.get('workflowComment'),
        workflowState: defaultState.get('workflowState'),
        workflowAssignee: defaultState.get('workflowAssignee'),
        workflowType: defaultState.get('workflowType'),
        disabledWorkflowState: defaultState.get('disabledWorkflowStatetrue'),
        workflowTxid: defaultState.get('workflowTxid'),
        editMode: defaultState.get('editMode'),
        workflowApprovalRequired: defaultState.get('workflowApprovalRequired'),
      });
    case SHOW_WORKFLOW_DETAILS:
      return state.merge({
        showDetails: action.show,
        showDetailsItemId: action.txid
      })
    case SET_WORKFLOW_CREATION_STEP:
      return state.set('creationStep', action.step);
    case ENABLE_WORKFLOW_SORT:
      return state.set('workflowSortEnabled', action.sortEnabled)
    case UPDATE_WORKFLOW_SORT:
      return state.merge({
        workflowItems: action.workflowItems
      })
    case ENABLE_BUDGET_EDIT:
      return state.set('subProjectBudgetEditEnabled', action.budgetEditEnabled)
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
