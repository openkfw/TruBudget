import { fromJS } from 'immutable';


import { SUBPROJECT_NAME, SUBPROJECT_AMOUNT, SUBPROJECT_COMMENT, SUBPROJECT_CURRENCY, CREATE_SUBPROJECT_SUCCESS, SHOW_SUBPROJECT_DIALOG, CANCEL_SUBPROJECT_DIALOG, SUBPROJECT_CREATION_STEP, FETCH_ALL_PROJECT_DETAILS_SUCCESS } from './actions';
import { LOGOUT } from '../Login/actions';


import { fromAmountString } from '../../helper';

const defaultState = fromJS({
  id: '',
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
  permissions: {},
  logs: []
});

const parsePermissions = p => p.length > 0 ? p[0].reduce((acc, val) => {
  acc[val[0]] = val[1];
  return acc;
}, {}) : {}

export default function detailviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_ALL_PROJECT_DETAILS_SUCCESS:
      return state.merge({
        id: action.id,
        projectName: action.displayName,
        projectAmount: fromAmountString(action.amount),
        projectCurrency: action.currency,
        projectComment: action.description,
        projectStatus: action.status,
        projectTS: action.creationUnixTs,
        permissions: fromJS(parsePermissions(action.permissions)),
        logs: fromJS(action.logs),
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
