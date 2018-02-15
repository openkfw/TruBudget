import { fromJS, Map } from 'immutable';
import moment from 'moment';
import strings from '../../localizeStrings';


import { FETCH_USERS_SUCCESS, FETCH_ROLES_SUCCESS, LOGIN_SUCCESS, STORE_USERNAME, STORE_PASSWORD, SHOW_LOGIN_ERROR, STORE_ENVIRONMENT_SUCCESS, SET_LANGUAGE, LOGOUT_SUCCESS, FETCH_USER_SUCCESS, TOKEN_FOUND, ADMIN_LOGIN_SUCCESS, FETCH_ADMIN_USER_SUCCESS, SHOW_ADMIN_LOGIN_ERROR, FETCH_ENVIRONMENT_SUCCESS } from './actions';
import { FETCH_UPDATES_SUCCESS } from '../LiveUpdates/actions';

export const defaultState = fromJS({
  users: [],
  username: '',
  password: '',
  loggedInUser: {},
  environment: 'Test',
  productionActive: false,
  loginErrorMessage: '',
  showLoginError: false,
  loggedInAdminUser: {},
  adminLoggedIn: false,
  adminLoginFailed: false,
  roles: [],
  language: 'en-gb',
  loggedIn: false,
  tokenPresent: false,
});

const setLanguage = (state) => {
  moment.locale(state.get('language'));
  strings.setLanguage(state.get('language'));
}

setLanguage(defaultState)


export default function loginReducer(state = defaultState, action) {
  switch (action.type) {
    case FETCH_UPDATES_SUCCESS:
    case FETCH_USERS_SUCCESS:
      return state.set('users', fromJS(action.users));
    case FETCH_ROLES_SUCCESS:
      return state.set('roles', fromJS(action.roles));
    case STORE_USERNAME:
      return state.set('username', action.username);
    case STORE_PASSWORD:
      return state.set('password', action.password);
    case FETCH_USER_SUCCESS:
      return state.merge({
        'loggedInUser': action.user,
        'jwt': action.jwt
      });
    case FETCH_ADMIN_USER_SUCCESS:
      return state.set('loggedInAdminUser', action.user);
    case LOGIN_SUCCESS:
      return state.merge({
        loggedIn: true,
        tokenPresent: true
      });
    case ADMIN_LOGIN_SUCCESS:
      return state.merge({
        adminLoggedIn: true,
      });
    case SHOW_LOGIN_ERROR:
      return state.set('loginUnsuccessful', action.show);
    case SHOW_ADMIN_LOGIN_ERROR:
      return state.set('adminLoginFailed', action.show);
    case STORE_ENVIRONMENT_SUCCESS:
    case FETCH_ENVIRONMENT_SUCCESS:
      return state.merge({
        environment: action.environment,
        productionActive: action.productionActive
      })
    case SET_LANGUAGE:
      const newState = state.set('language', action.language);
      setLanguage(newState);
      return newState;
    case TOKEN_FOUND:
      return state.set('tokenPresent', true);
    case LOGOUT_SUCCESS: {
      const newDefaultState = defaultState.set('language', state.get('language'))
      return newDefaultState;
    }
    default:
      return state
  }
}
