import { fromJS } from 'immutable';

import { FETCH_PROJECTS_SUCCESS, SHOW_WORKFLOW_DIALOG, PROJECT_NAME, PROJECT_AMOUNT, PROJECT_PURPOSE, PROJECT_CURRENCY, CREATE_PROJECT_SUCCESS, SET_PROJECT_CREATION_STEP } from './actions';
import { LOGOUT } from '../Login/actions';

const defaultState = fromJS({
  projects: [],
  workflowDialogVisible: false,
  projectName: '',
  projectAmount: '',
  projectPurpose: '',
  projectCurrency: 'EUR',
  creationStep: 0,
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_PROJECTS_SUCCESS:
      return state.set('projects', action.projects);
    case SHOW_WORKFLOW_DIALOG:
      return state.set('workflowDialogVisible', action.show);
    case PROJECT_NAME:
      return state.set('projectName', action.name);
    case PROJECT_AMOUNT:
      return state.set('projectAmount', action.amount);
    case PROJECT_PURPOSE:
      return state.set('projectPurpose', action.purpose);
    case PROJECT_CURRENCY:
      return state.set('projectCurrency', action.currency);
    case CREATE_PROJECT_SUCCESS:
      return state.merge({
        projectName: defaultState.get('projectName'),
        projectAmount: defaultState.get('projectAmount'),
        projectPurpose: defaultState.get('projectPurpose'),
        projectCurrency: defaultState.get('projectCurrency')
      });
    case SET_PROJECT_CREATION_STEP:
      return state.set('creationStep', action.step);
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
