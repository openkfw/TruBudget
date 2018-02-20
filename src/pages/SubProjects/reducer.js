import { fromJS } from 'immutable';


import { FETCH_PROJECT_DETAILS_SUCCESS, SUBPROJECT_NAME, SUBPROJECT_AMOUNT, SUBPROJECT_COMMENT, SUBPROJECT_CURRENCY, CREATE_SUBPROJECT_SUCCESS, SHOW_SUBPROJECT_DIALOG, CANCEL_SUBPROJECT_DIALOG, SUBPROJECT_CREATION_STEP, FETCH_ALL_PROJECT_DETAILS, FETCH_ALL_PROJECT_DETAILS_SUCCESS } from './actions';
import { LOGOUT } from '../Login/actions';


import { fromAmountString } from '../../helper';

const defaultState = fromJS({
  projectName: '',
  projectAmount: '',
  projectCurrency: '',
  projectComment: 'Default Comment',
  projectStatus: 'open',
  projectTS: 0,
  projectAssignee: [],
  projectApprover: [],
  projectBank: [],
  subProjects: [],
  subProjectName: '',
  subprojectsDialogVisible: false,
  subProjectAmount: '',
  subProjectComment: '',
  subProjectCurrency: '',
  showHistory: false,
  historyItems: [],
  currentStep: 0,
  roles: [],

});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_PROJECT_DETAILS_SUCCESS:
      return state.merge({
        projectName: action.projectDetails.details.name,
        projectAmount: fromAmountString(action.projectDetails.details.amount),
        projectCurrency: action.projectDetails.details.currency,
        projectComment: action.projectDetails.details.comment,
        projectStatus: action.projectDetails.details.status,
        projectTS: action.projectDetails.details.createTS,
        projectApprover: action.projectDetails.details.approver,
        projectAssignee: action.projectDetails.details.assignee,
        projectBank: action.projectDetails.details.bank,
        subProjects: action.projectDetails.subProjects,
        roles: action.roles,
        historyItems: action.historyItems,
      })
    case SUBPROJECT_CREATION_STEP:
      return state.set('currentStep', action.step);
    case SHOW_SUBPROJECT_DIALOG:
      return state.set('subprojectsDialogVisible', true);
    case CANCEL_SUBPROJECT_DIALOG:
      return state.merge({
        subProjectName: defaultState.get('subProjectName'),
        subProjectAmount: defaultState.get('subProjectAmount'),
        subProjectComment: defaultState.get('subProjectComment'),
        subProjectCurrency: defaultState.get('subProjectCurrency'),
        subprojectsDialogVisible: defaultState.get('subprojectsDialogVisible'),
        currentStep: defaultState.get('currentStep'),
      });
    case SUBPROJECT_NAME:
      return state.set('subProjectName', action.name);
    case SUBPROJECT_AMOUNT:
      return state.set('subProjectAmount', fromAmountString(action.amount));
    case SUBPROJECT_COMMENT:
      return state.set('subProjectComment', action.comment);
    case SUBPROJECT_CURRENCY:
      return state.set('subProjectCurrency', action.currency);
    case CREATE_SUBPROJECT_SUCCESS:
      return state.merge({
        subProjectName: defaultState.get('subProjectName'),
        subProjectAmount: defaultState.get('subProjectAmount'),
        subProjectComment: defaultState.get('subProjectComment'),
        subProjectCurrency: defaultState.get('subProjectCurrency')
      });
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
