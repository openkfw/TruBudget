import { fromJS } from 'immutable';

import { FETCH_PROJECTS_SUCCESS, SHOW_WORKFLOW_DIALOG, PROJECT_NAME,PROJECT_AMOUNT, PROJECT_PURPOSE, PROJECT_CURRENCY } from './actions';

const defaultState = fromJS({
  projects: [],
  workflowDialogVisible: false,
  projectName:'',
  projectAmount: '',
  projectPurpose: '',
  projectCurrency: 'EUR'
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
    default:
      return state
  }
}
