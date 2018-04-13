import { fromJS } from 'immutable';
import moment from 'moment';
import strings from '../../localizeStrings';


import { FETCH_USERS_SUCCESS, FETCH_ROLES_SUCCESS, LOGIN_SUCCESS, STORE_USERNAME, STORE_PASSWORD, SHOW_LOGIN_ERROR, STORE_ENVIRONMENT_SUCCESS, SET_LANGUAGE, LOGOUT_SUCCESS, FETCH_USER_SUCCESS, ADMIN_LOGIN_SUCCESS, FETCH_ADMIN_USER_SUCCESS, SHOW_ADMIN_LOGIN_ERROR, FETCH_ENVIRONMENT_SUCCESS, ADMIN_LOGOUT_SUCCESS, CLEAR_USER, INIT_LANGUAGE } from './actions';
import { FETCH_UPDATES_SUCCESS } from '../LiveUpdates/actions';

import { FETCH_ALL_PROJECTS_SUCCESS } from '../Overview/actions';
import { FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS } from '../Workflows/actions';
import { FETCH_ALL_PROJECT_DETAILS_SUCCESS } from '../SubProjects/actions';

export const defaultState = fromJS({
  username: '',
  password: '',
  id: '',
  displayName: '',
  organization: '',
  allowedIntents: [],
  avatarBackground: '/avatar_back.jpeg',
  avatar: '/lego_avatar_female2.jpg',
  loggedInUser: {
    role: {
      roleName: '',
      read: false,
      write: false,
      admin: false,
    }
  },
  users: [],
  user: [],
  environment: 'Test',
  productionActive: false,
  loginErrorMessage: '',
  showLoginError: false,
  loggedInAdminUser: {},
  adminLoggedIn: false,
  jwt: '',
  adminLoginFailed: false,
  roles: [],
  language: 'en-gb'
});

export const setLanguage = (state) => {
  const language = state.get('language');

  console.log(`Set language to ${language}`)
  moment.locale(language);
  strings.setLanguage(language);
}

export default function loginReducer(state = defaultState, action) {
  switch (action.type) {
    // case FETCH_UPDATES_SUCCESS:
    // case FETCH_USERS_SUCCESS:
    //   return state.set('users', fromJS(action.users));
    case FETCH_ALL_PROJECT_DETAILS_SUCCESS:
    case FETCH_ALL_SUBPROJECT_DETAILS_SUCCESS:
    case FETCH_ALL_PROJECTS_SUCCESS:
    case FETCH_ROLES_SUCCESS:
      return state.set('roles', fromJS(action.roles));
    case STORE_USERNAME:
      return state.set('username', action.username);
    case STORE_PASSWORD:
      return state.set('password', action.password);
    case FETCH_USER_SUCCESS:
      return state.set('user', action.user);
    case FETCH_ADMIN_USER_SUCCESS:
      return state.merge({
        'loggedInAdminUser': action.user,
        'jwt': action.jwt
      });

    case LOGIN_SUCCESS:
      return state.merge({
        jwt: action.token,
        id: action.id,
        displayName: action.displayName,
        organization: action.organization,
        allowedIntents: fromJS(action.allowedIntents),
      });
    case ADMIN_LOGIN_SUCCESS:
      return state.merge({
        adminLoggedIn: true,
      });
    case SHOW_LOGIN_ERROR:
      return state.set('loginUnsuccessful', action.show);
    case SHOW_ADMIN_LOGIN_ERROR:
      return state.set('adminLoginFailed', action.show);
    case CLEAR_USER:
      return state.set('loggedInUser', defaultState.get('loggedInUser'));
    case STORE_ENVIRONMENT_SUCCESS:
    case FETCH_ENVIRONMENT_SUCCESS:
      return state.merge({
        environment: action.environment,
        productionActive: action.productionActive
      })
    case INIT_LANGUAGE:
      setLanguage(state);
      return state;
    case SET_LANGUAGE:
      const newState = state.set('language', action.language);
      setLanguage(newState);
      return newState;
    case ADMIN_LOGOUT_SUCCESS:
    case LOGOUT_SUCCESS:
      return state.merge({
        'username': defaultState.get('username'),
        'password': defaultState.get('password'),
        'jwt': defaultState.get('jwt')
      });
    default:
      return state
  }
}
