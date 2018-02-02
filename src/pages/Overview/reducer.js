import { fromJS } from 'immutable';
import _ from 'lodash';

import {
  FETCH_PROJECTS_SUCCESS, PROJECT_NAME, PROJECT_AMOUNT, PROJECT_COMMENT, PROJECT_CURRENCY, CREATE_PROJECT_SUCCESS, SET_PROJECT_CREATION_STEP,
  ADD_APPROVER_ROLE, ADD_ASSIGNEMENT_ROLE, ADD_BANK_ROLE, REMOVE_APPROVER_ROLE, REMOVE_ASSIGNEMENT_ROLE, REMOVE_BANK_ROLE, SHOW_PROJECT_DIALOG, PROJECT_THUMBNAIL, HIDE_PROJECT_DIALOG
} from './actions';
import { LOGOUT } from '../Login/actions';
import { FETCH_UPDATES_SUCCESS } from '../LiveUpdates/actions';

import { fromAmountString } from '../../helper';

const defaultState = fromJS({
  projects: [],
  projectDialogVisible: false,
  projectName: '',
  projectAmount: '',
  projectComment: '',
  creationStep: 0,
  projectApprover: [],
  projectAssignee: [],
  projectCurrency: 'EUR',
  nextButtonEnabled: false,
  projectThumbnail: '/Thumbnail_0001.jpg',
  projectBank: []
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_UPDATES_SUCCESS:
    case FETCH_PROJECTS_SUCCESS:
      return state.set('projects', action.projects);
    case SHOW_PROJECT_DIALOG:
      return state.set('projectDialogVisible', true);
    case HIDE_PROJECT_DIALOG:
      return state.merge({
        projectName: defaultState.get('projectName'),
        projectAmount: defaultState.get('projectAmount'),
        projectComment: defaultState.get('projectComment'),
        projectCurrency: defaultState.get('projectCurrency'),
        projectApprover: defaultState.get('projectApprover'),
        projectAssignee: defaultState.get('projectAssignee'),
        projectBank: defaultState.get('projectBank'),
        projectThumbnail: defaultState.get('projectThumbnail'),
        projectDialogVisible: defaultState.get('projectDialogVisible'),
      });
    case PROJECT_NAME:
      return state.set('projectName', action.name);
    case PROJECT_AMOUNT:
      return state.set('projectAmount', fromAmountString(action.amount));
    case PROJECT_COMMENT:
      return state.set('projectComment', action.comment);
    case PROJECT_CURRENCY:
      return state.set('projectCurrency', action.currency);
    case PROJECT_THUMBNAIL:
      return state.set('projectThumbnail', action.thumbnail);
    case CREATE_PROJECT_SUCCESS:
      return state.merge({
        projectName: defaultState.get('projectName'),
        projectAmount: defaultState.get('projectAmount'),
        projectComment: defaultState.get('projectComment'),
        projectCurrency: defaultState.get('projectCurrency'),
        projectApprover: defaultState.get('projectApprover'),
        projectAssignee: defaultState.get('projectAssignee'),
        projectBank: defaultState.get('projectBank'),
        projectThumbnail: defaultState.get('projectThumbnail'),
      });
    case SET_PROJECT_CREATION_STEP:
      return state.set('creationStep', action.step);
    case ADD_APPROVER_ROLE:
      return state.set('projectApprover', fromJS(_.uniq([...state.get('projectApprover'), action.role])));
    case ADD_ASSIGNEMENT_ROLE:
      return state.set('projectAssignee', fromJS(_.uniq([...state.get('projectAssignee'), action.role])));
    case ADD_BANK_ROLE:
      return state.set('projectBank', fromJS(_.uniq([...state.get('projectBank'), action.role])));
    case REMOVE_APPROVER_ROLE:
      return state.set('projectApprover', state.get('projectApprover').delete(action.index));
    case REMOVE_ASSIGNEMENT_ROLE:
      return state.set('projectAssignee', state.get('projectAssignee').delete(action.index));
    case REMOVE_BANK_ROLE:
      return state.set('projectBank', state.get('projectBank').delete(action.index));
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
