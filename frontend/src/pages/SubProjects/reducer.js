import { fromJS } from 'immutable';
import _ from 'lodash';

import { SUBPROJECT_NAME, SUBPROJECT_AMOUNT, SUBPROJECT_COMMENT, SUBPROJECT_CURRENCY, CREATE_SUBPROJECT_SUCCESS, SHOW_SUBPROJECT_DIALOG, CANCEL_SUBPROJECT_DIALOG, SUBPROJECT_CREATION_STEP, FETCH_ALL_PROJECT_DETAILS_SUCCESS, FETCH_PROJECT_PERMISSIONS_SUCCESS, SHOW_PROJECT_PERMISSIONS, HIDE_PROJECT_PERMISSIONS } from './actions';
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
  roles: [],
  permissions: {},
  logs: [],
  thumbnail: '/Thumbnail_0001.jpg',
  allowedIntents: [],
  permissionDialogShown: false
});

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
        allowedIntents: fromJS(action.allowedIntents),
        logs: fromJS(action.logs),
      })
    case SHOW_PROJECT_PERMISSIONS:
      return state.set('permissionDialogShown', true);
    case HIDE_PROJECT_PERMISSIONS:
      return state.set('permissionDialogShown', false);
    case FETCH_PROJECT_PERMISSIONS_SUCCESS:
      return state.set('permissions', fromJS(action.permissions))
    case SHOW_SUBPROJECT_DIALOG:
      return state.set('subprojectsDialogVisible', true);
    case CANCEL_SUBPROJECT_DIALOG:
      return state.merge({
        subProjectName: defaultState.get('subProjectName'),
        subProjectAmount: defaultState.get('subProjectAmount'),
        subProjectComment: defaultState.get('subProjectComment'),
        subProjectCurrency: defaultState.get('subProjectCurrency'),
        subprojectsDialogVisible: defaultState.get('subprojectsDialogVisible'),
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
