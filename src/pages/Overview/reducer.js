import { fromJS } from 'immutable';
import _ from 'lodash';

import {
  FETCH_PROJECTS_SUCCESS, PROJECT_NAME, PROJECT_AMOUNT, PROJECT_COMMENT, PROJECT_CURRENCY, CREATE_PROJECT_SUCCESS, SET_PROJECT_CREATION_STEP,
  ADD_APPROVER_ROLE, ADD_ASSIGNEMENT_ROLE, ADD_BANK_ROLE, REMOVE_APPROVER_ROLE, REMOVE_ASSIGNEMENT_ROLE, REMOVE_BANK_ROLE, SHOW_PROJECT_DIALOG, PROJECT_THUMBNAIL
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
  projectThumbnail: '/amazon_cover.jpg',
  projectBank: []
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_UPDATES_SUCCESS:
    case FETCH_PROJECTS_SUCCESS:
      return state.set('projects', action.projects);
    case SHOW_PROJECT_DIALOG:
      return state.set('projectDialogVisible', action.show);
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
      return state.set('projectApprover', _.uniq([...state.get('projectApprover'), action.role]));
    case ADD_ASSIGNEMENT_ROLE:
      return state.set('projectAssignee', _.uniq([...state.get('projectAssignee'), action.role]));
    case ADD_BANK_ROLE:
      return state.set('projectBank', _.uniq([...state.get('projectBank'), action.role]));
    case REMOVE_APPROVER_ROLE:
      return state.set('projectApprover', _.pull([...state.get('projectApprover')], action.role));
    case REMOVE_ASSIGNEMENT_ROLE:
      return state.set('projectAssignee', _.pull([...state.get('projectAssignee')], action.role));
    case REMOVE_BANK_ROLE:
      return state.set('projectBank', _.pull([...state.get('projectBank')], action.role));
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
