import { fromJS } from 'immutable';


import { FETCH_PROJECT_DETAILS_SUCCESS, SHOW_WORKFLOW_DIALOG,SUBPROJECT_NAME, SUBPROJECT_AMOUNT, SUBPROJECT_PURPOSE,SUBPROJECT_CURRENCY } from './actions';

const defaultState =  fromJS({
  projectName: '',
  subProjects: [],
  subProjectName:'',
  workflowDialogVisible: false,
  subProjectAmount:'',
  subProjectPurpose:'',
  subProjectCurrency:'EUR'
});

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_PROJECT_DETAILS_SUCCESS:
      return state.merge({
        'projectName': action.projectDetails.name,
        'subProjects': action.projectDetails.subProjects,
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
    default:
      return state
  }
}
