import { fromJS } from 'immutable';


import { FETCH_PROJECT_DETAILS_SUCCESS, SHOW_WORKFLOW_DIALOG, SUBPROJECT_NAME, SUBPROJECT_AMOUNT, SUBPROJECT_PURPOSE, SUBPROJECT_CURRENCY, CREATE_SUBPROJECT_ITEM_SUCCESS, OPEN_HISTORY, FETCH_HISTORY_SUCCESS} from './actions';
import { LOGOUT } from '../../Login/actions';

const defaultState = fromJS({
  projectName: '',
  projectAmount: 0,
  projectCurrency: 'EUR',
  projectPurpose: 'Default Purpose',
  projectStatus: 'open',
  subProjects: [],
  subProjectName: '',
  workflowDialogVisible: false,
  subProjectAmount: '',
  subProjectPurpose: '',
  subProjectCurrency: 'EUR',
  showHistory: false,
  historyItems:[],
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_PROJECT_DETAILS_SUCCESS:
      return state.merge({
        projectName: action.projectDetails.details.projectName,
        projectAmount: action.projectDetails.details.amount,
        projectCurrency: action.projectDetails.details.currency,
        projectPurpose: action.projectDetails.details.purpose,
        projectStatus: action.projectDetails.details.status,
        subProjects: action.projectDetails.subProjects,
      });
    case SHOW_WORKFLOW_DIALOG:
      return state.set('workflowDialogVisible', action.show);
    case SUBPROJECT_NAME:
      return state.set('subProjectName', action.name);
    case SUBPROJECT_AMOUNT:
      return state.set('subProjectAmount', action.amount);
    case SUBPROJECT_PURPOSE:
      return state.set('subProjectPurpose', action.purpose);
    case SUBPROJECT_CURRENCY:
      return state.set('subProjectCurrency', action.currency);
    case OPEN_HISTORY:
      return state.set('showHistory', action.show);
    case FETCH_HISTORY_SUCCESS:
      return state.set('historyItems', action.historyItems);
    case CREATE_SUBPROJECT_ITEM_SUCCESS:
      return state.merge({
        subProjectName: defaultState.subProjectName,
        subProjectAmount: defaultState.subProjectAmount,
        subProjectPurpose: defaultState.subProjectPurpose,
        subProjectCurrency: defaultState.subProjectCurrency
      });
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
