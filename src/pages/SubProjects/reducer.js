import { fromJS } from 'immutable';

import { FETCH_PROJECT_DETAILS_SUCCESS, SHOW_WORKFLOW_DIALOG, SUBPROJECT_NAME, SUBPROJECT_AMOUNT, SUBPROJECT_PURPOSE, SUBPROJECT_CURRENCY, CREATE_SUBPROJECT_ITEM_SUCCESS } from './actions';
import { LOGOUT } from '../Login/actions';

import { fromAmountString } from '../../helper';

const defaultState = fromJS({
  projectName: '',
  projectAmount: 0,
  projectCurrency: 'EUR',
  projectPurpose: 'Default Purpose',
  projectStatus: 'open',
  projectTS: 0,
  projectAssignee: [],
  projectApprover: [],
  projectBank: [],
  subProjects: [],
  subProjectName: '',
  workflowDialogVisible: false,
  subProjectAmount: 0,
  subProjectPurpose: '',
  subProjectCurrency: 'EUR',
  showHistory: false,
  historyItems: [],

});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_PROJECT_DETAILS_SUCCESS:
      return state.merge({
        projectName: action.projectDetails.details.projectName,
        projectAmount: fromAmountString(action.projectDetails.details.amount),
        projectCurrency: action.projectDetails.details.currency,
        projectPurpose: action.projectDetails.details.purpose,
        projectStatus: action.projectDetails.details.status,
        projectTS: action.projectDetails.details.createTS,
        projectApprover: action.projectDetails.details.approver,
        projectAssignee: action.projectDetails.details.assignee,
        projectBank: action.projectDetails.details.bank,
        subProjects: action.projectDetails.subProjects,
      });
    case SHOW_WORKFLOW_DIALOG:
      return state.set('workflowDialogVisible', action.show);
    case SUBPROJECT_NAME:
      return state.set('subProjectName', action.name);
    case SUBPROJECT_AMOUNT:
      return state.set('subProjectAmount', fromAmountString(action.amount));
    case SUBPROJECT_PURPOSE:
      return state.set('subProjectPurpose', action.purpose);
    case SUBPROJECT_CURRENCY:
      return state.set('subProjectCurrency', action.currency);
    case CREATE_SUBPROJECT_ITEM_SUCCESS:
      return state.merge({
        subProjectName: defaultState.get('subProjectName'),
        subProjectAmount: defaultState.get('subProjectAmount'),
        subProjectPurpose: defaultState.get('subProjectPurpose'),
        subProjectCurrency: defaultState.get('subProjectCurrency')
      });
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
