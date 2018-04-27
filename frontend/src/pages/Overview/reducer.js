import { fromJS, Set } from 'immutable';

import {
  FETCH_PROJECTS_SUCCESS, PROJECT_NAME, PROJECT_AMOUNT, PROJECT_COMMENT, PROJECT_CURRENCY, CREATE_PROJECT_SUCCESS, PROJECT_CREATION_STEP,
  ADD_APPROVER_ROLE, ADD_ASSIGNEMENT_ROLE, ADD_BANK_ROLE, REMOVE_APPROVER_ROLE, REMOVE_ASSIGNEMENT_ROLE, REMOVE_BANK_ROLE, SHOW_PROJECT_DIALOG, PROJECT_THUMBNAIL, CANCEL_PROJECT_DIALOG, FETCH_ALL_PROJECTS_SUCCESS
} from './actions';
import { LOGOUT } from '../Login/actions';
import { FETCH_UPDATES_SUCCESS } from '../LiveUpdates/actions';

import { fromAmountString } from '../../helper';

const defaultState = fromJS({
  projects: Set(),
  dialogShown: false,
  displayName: '',
  amount: '',
  description: '',
  currentStep: 0,
  initialFetch: false,
  projectApprover: Set(),
  projectAssignee: Set(),
  projectBank: Set(),
  currency: 'EUR',
  nextButtonEnabled: false,
  roles: [],
  loading: false,
  thumbnail: '/Thumbnail_0001.jpg',
  logs: [],
  allowedIntents: []
});

export default function overviewReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_UPDATES_SUCCESS:
    case FETCH_PROJECTS_SUCCESS:
      return state.set('projects', fromJS(action.projects));
    case SHOW_PROJECT_DIALOG:
      return state.set('dialogShown', true);
    case CANCEL_PROJECT_DIALOG:
      return state.merge({
        displayName: defaultState.get('displayName'),
        amount: defaultState.get('amount'),
        description: defaultState.get('description'),
        currency: defaultState.get('currency'),
        projectApprover: defaultState.get('projectApprover'),
        projectAssignee: defaultState.get('projectAssignee'),
        projectBank: defaultState.get('projectBank'),
        thumbnail: defaultState.get('thumbnail'),
        currentStep: defaultState.get('currentStep'),
        dialogShown: defaultState.get('dialogShown'),
      });
    case PROJECT_NAME:
      return state.set('displayName', action.name);
    case PROJECT_AMOUNT:
      return state.set('amount', action.amount);
    case PROJECT_COMMENT:
      return state.set('description', action.comment);
    case PROJECT_CURRENCY:
      return state.set('currency', action.currency);
    case PROJECT_THUMBNAIL:
      return state.set('thumbnail', action.thumbnail);
    case CREATE_PROJECT_SUCCESS:
      return state.merge({
        displayName: defaultState.get('displayName'),
        amount: defaultState.get('amount'),
        description: defaultState.get('description'),
        currency: defaultState.get('currency'),
        projectApprover: defaultState.get('projectApprover'),
        projectAssignee: defaultState.get('projectAssignee'),
        projectBank: defaultState.get('projectBank'),
        thumbnail: defaultState.get('thumbnail'),
      });
    case PROJECT_CREATION_STEP:
      return state.set('currentStep', action.step);
    case ADD_APPROVER_ROLE:
      return state.update('projectApprover', approvers => approvers.add(action.role));
    case ADD_ASSIGNEMENT_ROLE:
      return state.update('projectAssignee', assignees => assignees.add(action.role));
    case ADD_BANK_ROLE:
      return state.update('projectBank', bank => bank.add(action.role));
    case REMOVE_APPROVER_ROLE:
      return state.update('projectApprover', approvers => approvers.delete(action.role));
    case REMOVE_ASSIGNEMENT_ROLE:
      return state.update('projectAssignee', assignees => assignees.delete(action.role));
    case REMOVE_BANK_ROLE:
      return state.update('projectBank', bank => bank.delete(action.role));
    case FETCH_ALL_PROJECTS_SUCCESS:
      return state.merge({
        projects: action.projects,
        roles: action.roles,
      });
    case LOGOUT:
      return defaultState;
    default:
      return state
  }
}
