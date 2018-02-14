import { fromJS } from 'immutable';

import {
  FETCH_WORKFLOW_ITEMS_SUCCESS,
  SHOW_WORKFLOW_DIALOG,
  WORKFLOW_NAME,
  WORKFLOW_AMOUNT,
  WORKFLOW_AMOUNT_TYPE,
  WORKFLOW_PURPOSE,
  WORKFLOW_CURRENCY,
  WORKFLOW_STATUS,
  WORKFLOW_STATUS_DISABLED,
  WORKFLOW_TXID,
  CREATE_WORKFLOW_SUCCESS,
  EDIT_WORKFLOW_SUCCESS,
  SHOW_WORKFLOW_DETAILS,
  UPDATE_WORKFLOW_SORT,
  ENABLE_WORKFLOW_SORT,
  WORKFLOW_TYPE,
  ENABLE_BUDGET_EDIT,
  SUBPROJECT_AMOUNT,
  WORKFLOW_APPROVAL_REQUIRED,
  CANCEL_WORKFLOW_DIALOG,
  WORKFLOW_CREATION_STEP
} from './actions';

import { LOGOUT } from '../Login/actions';
import { fromAmountString } from '../../helper';

const defaultState = fromJS({
  workflowItems: [],
  subProjectDetails: {
    approver: [],
    assignee: [],
    bank: [],
  },
  workflowToAdd: {
    name: '',
    type: 'workflow',
    amount: '',
    amountType: 'na',
    currency: '',
    comment: '',
    approvalRequired: true,
    status: 'open',
    txId: ''
  },
  workflowDialogVisible: false,
  editMode: false,
  showDetails: false,
  showDetailsItemId: '',
  showHistory: false,
  historyItems: [],
  currentStep: 0,
  workflowSortEnabled: false,
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
        workflowDialogVisible: action.show,
        editMode: action.editMode
      })
    case CANCEL_WORKFLOW_DIALOG:
      return state.merge({
        workflowDialogVisible: action.show,
        workflowToAdd: defaultState.getIn(['workflowToAdd']),
        editMode: defaultState.get('editMode'),
        currentStep: defaultState.get('currentStep'),
      })
    case WORKFLOW_CREATION_STEP:
      return state.set('currentStep', action.step);
    case WORKFLOW_NAME:
      return state.setIn(['workflowToAdd', 'name'], action.name);
    case WORKFLOW_TYPE:
      return state.setIn(['workflowToAdd', 'type'], action.workflowType);
    case WORKFLOW_APPROVAL_REQUIRED:
      return state.setIn(['workflowToAdd', 'approvalRequired'], action.approvalRequired);
    case WORKFLOW_AMOUNT:
      return state.setIn(['workflowToAdd', 'amount'], fromAmountString(action.amount));
    case WORKFLOW_AMOUNT_TYPE:
      return state.setIn(['workflowToAdd', 'amountType'], action.amountType);
    case WORKFLOW_PURPOSE:
      return state.setIn(['workflowToAdd', 'comment'], action.comment);
    case WORKFLOW_CURRENCY:
      return state.setIn(['workflowToAdd', 'currency'], action.currency);
    case WORKFLOW_STATUS:
      return state.setIn(['workflowToAdd', 'status'], action.status);
    case WORKFLOW_TXID:
      return state.setIn(['workflowToAdd', 'txId'], action.txid);
    case SUBPROJECT_AMOUNT:
      return state.set('subProjectAmount', action.amount)
    case CREATE_WORKFLOW_SUCCESS:
    case EDIT_WORKFLOW_SUCCESS:
      return state.merge({
        workflowToAdd: defaultState.getIn(['workflowToAdd']),
        workflowState: defaultState.get('workflowState'),
        editMode: defaultState.get('editMode'),
      });
    case SHOW_WORKFLOW_DETAILS:
      return state.merge({
        showDetails: action.show,
        showDetailsItemId: action.txid
      })
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
